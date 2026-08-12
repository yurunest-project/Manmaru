import Foundation

enum InviteCodeGenerator {
    private static let alphabet = Array("ABCDEFGHJKLMNPQRSTUVWXYZ23456789")

    static func make(length: Int = 6) -> String {
        String((0..<length).map { _ in alphabet.randomElement()! })
    }
}
