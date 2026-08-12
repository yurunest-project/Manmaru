import AuthenticationServices
import CryptoKit
import FirebaseAuth
import Foundation
import UIKit

struct AppleSignInResult {
    let uid: String
    let displayName: String
}

enum AuthServiceError: LocalizedError {
    case firebaseMissing
    case missingIdentityToken
    case cancelled

    var errorDescription: String? {
        switch self {
        case .firebaseMissing:
            "Firebase の設定ファイルがまだ入っていません。"
        case .missingIdentityToken:
            "Apple の認証情報を取得できませんでした。"
        case .cancelled:
            "サインインがキャンセルされました。"
        }
    }
}

@MainActor
final class AuthService {
    private var handle: AuthStateDidChangeListenerHandle?
    private var appleCoordinator: AppleSignInCoordinator?

    func start(onChange: @escaping (User?) -> Void) {
        handle = Auth.auth().addStateDidChangeListener { _, user in
            Task { @MainActor in
                onChange(user)
            }
        }
    }

    func stop() {
        if let handle {
            Auth.auth().removeStateDidChangeListener(handle)
        }
        handle = nil
    }

    func signInWithApple() async throws -> AppleSignInResult {
        guard FirebaseBootstrap.isConfigured else { throw AuthServiceError.firebaseMissing }

        let coordinator = AppleSignInCoordinator()
        appleCoordinator = coordinator
        let apple = try await coordinator.signIn()
        appleCoordinator = nil

        let credential = OAuthProvider.appleCredential(
            withIDToken: apple.idToken,
            rawNonce: apple.nonce,
            fullName: apple.fullName
        )
        let result = try await Auth.auth().signIn(with: credential)
        let name = PersonNameComponentsFormatter().string(from: apple.fullName ?? PersonNameComponents())
        return AppleSignInResult(uid: result.user.uid, displayName: name)
    }

    func signOut() throws {
        try Auth.auth().signOut()
    }
}

private struct AppleAuthorization {
    let idToken: String
    let nonce: String
    let fullName: PersonNameComponents?
}

private final class AppleSignInCoordinator: NSObject, ASAuthorizationControllerDelegate, ASAuthorizationControllerPresentationContextProviding {
    private var continuation: CheckedContinuation<AppleAuthorization, Error>?
    private var nonce = ""

    func signIn() async throws -> AppleAuthorization {
        try await withCheckedThrowingContinuation { continuation in
            self.continuation = continuation
            self.nonce = Self.randomNonce()

            let request = ASAuthorizationAppleIDProvider().createRequest()
            request.requestedScopes = [.fullName]
            request.nonce = Self.sha256(nonce)

            let controller = ASAuthorizationController(authorizationRequests: [request])
            controller.delegate = self
            controller.presentationContextProvider = self
            controller.performRequests()
        }
    }

    func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .flatMap(\.windows)
            .first { $0.isKeyWindow } ?? ASPresentationAnchor()
    }

    func authorizationController(controller: ASAuthorizationController, didCompleteWithAuthorization authorization: ASAuthorization) {
        guard let credential = authorization.credential as? ASAuthorizationAppleIDCredential,
              let tokenData = credential.identityToken,
              let idToken = String(data: tokenData, encoding: .utf8)
        else {
            continuation?.resume(throwing: AuthServiceError.missingIdentityToken)
            continuation = nil
            return
        }

        continuation?.resume(returning: AppleAuthorization(idToken: idToken, nonce: nonce, fullName: credential.fullName))
        continuation = nil
    }

    func authorizationController(controller: ASAuthorizationController, didCompleteWithError error: Error) {
        if let authError = error as? ASAuthorizationError, authError.code == .canceled {
            continuation?.resume(throwing: AuthServiceError.cancelled)
        } else {
            continuation?.resume(throwing: error)
        }
        continuation = nil
    }

    private static func randomNonce(length: Int = 32) -> String {
        let charset = Array("0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._")
        var result = ""
        var remaining = length
        while remaining > 0 {
            var random: UInt8 = 0
            let status = SecRandomCopyBytes(kSecRandomDefault, 1, &random)
            if status != errSecSuccess { continue }
            if random < charset.count {
                result.append(charset[Int(random)])
                remaining -= 1
            }
        }
        return result
    }

    private static func sha256(_ input: String) -> String {
        let data = Data(input.utf8)
        let hash = SHA256.hash(data: data)
        return hash.compactMap { String(format: "%02x", $0) }.joined()
    }
}
