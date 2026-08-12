import SwiftUI

struct AppCard<Content: View>: View {
    @Environment(\.appTheme) private var theme
    var padding: CGFloat = 20
    @ViewBuilder var content: () -> Content

    var body: some View {
        content()
            .padding(padding)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(theme.surface)
            .clipShape(RoundedRectangle(cornerRadius: theme.radius, style: .continuous))
            .shadow(color: theme.shadow, radius: 18, x: 0, y: 10)
    }
}
