import MapKit
import SwiftUI

struct PlaceSearchView: View {
    @Environment(\.appTheme) private var theme
    @Environment(\.dismiss) private var dismiss
    @State private var query = ""
    @State private var results: [MKMapItem] = []
    @State private var isSearching = false
    let onSelect: (Destination) -> Void

    var body: some View {
        NavigationStack {
            ZStack {
                theme.background.ignoresSafeArea()
                VStack(spacing: 16) {
                    AppCard(padding: 12) {
                        HStack {
                            Image(systemName: "magnifyingglass")
                                .foregroundStyle(theme.textSecondary)
                            TextField("お店や場所を検索", text: $query)
                                .font(.manmaru(.body))
                                .textInputAutocapitalization(.never)
                                .autocorrectionDisabled()
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 12)

                    if isSearching {
                        ProgressView()
                            .tint(theme.primary)
                            .padding(.top, 20)
                    }

                    List(Array(results.enumerated()), id: \.offset) { _, item in
                        Button {
                            let destination = Destination(
                                name: item.name ?? "行き先",
                                address: item.placemark.title ?? "",
                                latitude: item.placemark.coordinate.latitude,
                                longitude: item.placemark.coordinate.longitude
                            )
                            onSelect(destination)
                            Haptics.success()
                            dismiss()
                        } label: {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(item.name ?? "場所")
                                    .font(.manmaru(.headline, weight: .semibold))
                                    .foregroundStyle(theme.text)
                                if let title = item.placemark.title {
                                    Text(title)
                                        .font(.manmaru(.caption))
                                        .foregroundStyle(theme.textSecondary)
                                }
                            }
                            .padding(.vertical, 4)
                        }
                        .listRowBackground(theme.surface)
                    }
                    .listStyle(.plain)
                    .scrollContentBackground(.hidden)
                }
            }
            .navigationTitle("行き先を探す")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("閉じる") { dismiss() }
                        .foregroundStyle(theme.primary)
                }
            }
            .toolbarBackground(theme.background, for: .navigationBar)
            .task(id: query) {
                await search()
            }
        }
        .environment(\.appTheme, theme)
    }

    private func search() async {
        let trimmed = query.trimmingCharacters(in: .whitespacesAndNewlines)
        guard trimmed.count >= 2 else {
            results = []
            return
        }
        try? await Task.sleep(for: .milliseconds(280))
        guard !Task.isCancelled else { return }
        isSearching = true
        defer { isSearching = false }

        let request = MKLocalSearch.Request()
        request.naturalLanguageQuery = trimmed
        request.resultTypes = [.pointOfInterest, .address]
        let search = MKLocalSearch(request: request)
        do {
            let response = try await search.start()
            results = response.mapItems
        } catch {
            results = []
        }
    }
}
