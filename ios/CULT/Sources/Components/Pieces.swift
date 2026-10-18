import SwiftUI

// MARK: - Цена: клубная и РРЦ

struct PriceView: View {
    let club: Int
    let rrp: Int
    var size: Size = .medium
    var isMember: Bool
    var onLocked: (() -> Void)?

    enum Size { case small, medium, large
        var club: CGFloat { switch self { case .small: 14; case .medium: 16; case .large: 23 } }
        var rrp: CGFloat  { switch self { case .small: 12; case .medium: 12; case .large: 14 } }
    }

    var body: some View {
        if rrp == 0 {
            Text("СКОРО")
                .font(Typo.semi(10)).tracking(0.8)
                .foregroundStyle(Palette.muted)
                .padding(.horizontal, 7).padding(.vertical, 4)
                .background(Palette.surface3, in: Capsule())
        } else {
            HStack(alignment: .firstTextBaseline, spacing: 7) {
                Text(Money.string(club))
                    .font(Typo.bold(size.club))
                    .monospacedDigit()
                    .foregroundStyle(isMember ? Palette.ink : Palette.goldInk)
                Text(Money.string(rrp))
                    .font(Typo.regular(size.rrp))
                    .monospacedDigit()
                    .strikethrough()
                    .foregroundStyle(Palette.faint)
                if isMember {
                    Text("−\(Int((1 - Double(club) / Double(rrp)) * 100 + 0.5))%")
                        .font(Typo.bold(10))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 6).padding(.vertical, 3)
                        .background(Palette.sale, in: RoundedRectangle(cornerRadius: 5))
                } else {
                    Label("в клубе", systemImage: "lock.fill")
                        .font(Typo.semi(11))
                        .labelStyle(.titleAndIcon)
                        .foregroundStyle(Palette.goldInk)
                        .onTapGesture { onLocked?() }
                }
            }
        }
    }
}

// MARK: - Полоса выгоды

struct SavingStrip<Content: View>: View {
    var icon = "sparkles"
    @ViewBuilder let content: Content

    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: icon)
                .font(.system(size: 18))
                .foregroundStyle(Palette.gold)
            content
            Spacer(minLength: 0)
        }
        .padding(13)
        .background(Palette.goldWash, in: RoundedRectangle(cornerRadius: Metrics.radiusSm, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: Metrics.radiusSm, style: .continuous)
                .strokeBorder(Palette.gold.opacity(0.32), lineWidth: 1)
        )
    }
}

// MARK: - Горизонтальные фильтры

struct Chips<T: Hashable & Identifiable>: View {
    let items: [T]
    let title: (T) -> String
    @Binding var selection: T.ID

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 7) {
                ForEach(items) { item in
                    let on = item.id == selection
                    Button {
                        Haptics.select()
                        withAnimation(.snappy(duration: 0.2)) { selection = item.id }
                    } label: {
                        Text(title(item))
                            .font(Typo.medium(13))
                            .foregroundStyle(on ? Palette.onInk : Palette.ink2)
                            .padding(.horizontal, 14)
                            .frame(height: 34)
                            .background(on ? Palette.ink : Palette.surface, in: Capsule())
                            .overlay(Capsule().strokeBorder(on ? .clear : Palette.line, lineWidth: 1))
                    }
                    .buttonStyle(PressStyle())
                }
            }
            .padding(.horizontal, Metrics.pad)
        }
        .scrollClipDisabled()
    }
}

struct SimpleChip: Identifiable, Hashable {
    let id: String
    let title: String
}

// MARK: - Раскрывающийся блок

struct Accordion<Content: View>: View {
    let label: String
    var openByDefault = false
    @ViewBuilder let content: Content
    @State private var open = false

    var body: some View {
        VStack(spacing: 0) {
            Button {
                Haptics.tap()
                withAnimation(.snappy(duration: 0.26)) { open.toggle() }
            } label: {
                HStack {
                    Text(label).font(Typo.semi(14)).foregroundStyle(Palette.ink)
                    Spacer()
                    Image(systemName: "chevron.down")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(Palette.faint)
                        .rotationEffect(.degrees(open ? 180 : 0))
                }
                .padding(.vertical, 15)
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)

            if open {
                content
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.bottom, 16)
                    .transition(.opacity.combined(with: .move(edge: .top)))
            }
        }
        .overlay(alignment: .top) { Rectangle().fill(Palette.lineSoft).frame(height: 1) }
        .onAppear { open = openByDefault }
    }
}

// MARK: - Счётчик количества

struct QtyStepper: View {
    @Binding var value: Int
    var min: Int = 1

    var body: some View {
        HStack(spacing: 0) {
            button("minus") { value = Swift.max(min, value - 1) }
                .disabled(value <= min)
            Text("\(value)")
                .font(Typo.semi(14)).monospacedDigit()
                .frame(minWidth: 32)
            button("plus") { value = Swift.min(99, value + 1) }
        }
        .frame(height: 38)
        .background(Palette.surface, in: RoundedRectangle(cornerRadius: 8))
        .overlay(RoundedRectangle(cornerRadius: 8).strokeBorder(Palette.line, lineWidth: 1))
    }

    private func button(_ icon: String, action: @escaping () -> Void) -> some View {
        Button {
            Haptics.select()
            action()
        } label: {
            Image(systemName: icon)
                .font(.system(size: 13, weight: .semibold))
                .frame(width: 38, height: 38)
                .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .foregroundStyle(Palette.ink)
    }
}

// MARK: - Пустое состояние

struct EmptyStateView: View {
    let icon: String
    let title: String
    var text: String?
    var actionTitle: String?
    var action: (() -> Void)?

    var body: some View {
        VStack(spacing: 0) {
            Image(systemName: icon)
                .font(.system(size: 44, weight: .light))
                .foregroundStyle(Palette.line)
                .padding(.bottom, 16)
            Text(title).font(Typo.semi(17)).foregroundStyle(Palette.ink)
            if let text {
                Text(text)
                    .font(.system(size: 13))
                    .foregroundStyle(Palette.muted)
                    .multilineTextAlignment(.center)
                    .padding(.top, 7)
            }
            if let actionTitle, let action {
                Button(actionTitle, action: action)
                    .font(Typo.semi(14))
                    .foregroundStyle(Palette.onInk)
                    .padding(.horizontal, 20).frame(height: 44)
                    .background(Palette.ink, in: Capsule())
                    .padding(.top, 20)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.horizontal, 32)
        .padding(.vertical, 56)
    }
}
