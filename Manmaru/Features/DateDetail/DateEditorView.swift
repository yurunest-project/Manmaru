import SwiftUI

struct DateEditorView: View {
    @Environment(AppModel.self) private var model
    @Environment(\.appTheme) private var theme
    @Environment(\.dismiss) private var dismiss

    @State private var plan: DatePlan
    @State private var showPlaceSearch = false

    init(plan: DatePlan) {
        _plan = State(initialValue: plan)
    }

    var body: some View {
        NavigationStack {
            ZStack {
                theme.background.ignoresSafeArea()
                ScrollView(showsIndicators: false) {
                    VStack(alignment: .leading, spacing: 20) {
                        dateSection
                        titleSection
                        destinationsSection
                        memoSection
                        PrimaryButton(title: "保存する", systemImage: "checkmark") {
                            Task {
                                await model.saveDate(plan)
                                dismiss()
                            }
                        }
                        Color.clear.frame(height: 20)
                    }
                    .padding(20)
                }
            }
            .navigationTitle(isNewPlan ? "デートを登録" : "デートを編集")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("閉じる") { dismiss() }
                        .foregroundStyle(theme.primary)
                }
            }
            .toolbarBackground(theme.background, for: .navigationBar)
            .sheet(isPresented: $showPlaceSearch) {
                PlaceSearchView { destination in
                    plan.destinations.append(destination)
                }
                .environment(\.appTheme, theme)
            }
        }
        .environment(\.appTheme, theme)
    }

    private var isNewPlan: Bool {
        !model.dates.contains { $0.id == plan.id }
    }

    private var dateSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("日付")
                .font(.manmaru(.headline, weight: .bold))
                .foregroundStyle(theme.text)
            AppCard {
                DatePicker("デートの日", selection: $plan.date, displayedComponents: .date)
                    .datePickerStyle(.graphical)
                    .labelsHidden()
                    .tint(theme.primary)
            }
        }
    }

    private var titleSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("タイトル（任意）")
                .font(.manmaru(.headline, weight: .bold))
                .foregroundStyle(theme.text)
            AppCard {
                TextField("例）水族館デート", text: $plan.title)
                    .font(.manmaru(.body))
                    .foregroundStyle(theme.text)
            }
        }
    }

    private var destinationsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("行き先")
                    .font(.manmaru(.headline, weight: .bold))
                    .foregroundStyle(theme.text)
                Spacer()
                Button {
                    showPlaceSearch = true
                } label: {
                    Label("追加", systemImage: "plus")
                        .font(.manmaru(.subheadline, weight: .semibold))
                        .foregroundStyle(theme.primary)
                }
            }

            if plan.destinations.isEmpty {
                AppCard {
                    Text("お店や場所を複数登録できます。タップすると車ルートが開きます。")
                        .font(.manmaru(.subheadline))
                        .foregroundStyle(theme.textSecondary)
                }
            } else {
                ForEach(plan.destinations) { destination in
                    AppCard {
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(destination.name)
                                    .font(.manmaru(.headline, weight: .semibold))
                                    .foregroundStyle(theme.text)
                                if !destination.address.isEmpty {
                                    Text(destination.address)
                                        .font(.manmaru(.caption))
                                        .foregroundStyle(theme.textSecondary)
                                }
                            }
                            Spacer()
                            Button(role: .destructive) {
                                plan.destinations.removeAll { $0.id == destination.id }
                            } label: {
                                Image(systemName: "trash")
                                    .foregroundStyle(theme.danger)
                            }
                        }
                    }
                }
            }
        }
    }

    private var memoSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("メモ")
                .font(.manmaru(.headline, weight: .bold))
                .foregroundStyle(theme.text)
            AppCard {
                TextEditor(text: $plan.memo)
                    .scrollContentBackground(.hidden)
                    .font(.manmaru(.body))
                    .foregroundStyle(theme.text)
                    .frame(minHeight: 120)
            }
        }
    }
}
