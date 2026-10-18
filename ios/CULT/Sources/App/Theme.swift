import SwiftUI

/// Палитра брендбука BYRAIN: монохром плюс шампань-золото как клубный акцент.
enum Palette {
    static func dyn(_ light: UInt32, _ dark: UInt32) -> Color {
        Color(UIColor { $0.userInterfaceStyle == .dark ? UIColor(hex: dark) : UIColor(hex: light) })
    }

    static let bg        = dyn(0xFFFFFF, 0x0D0D0D)
    static let sunken    = dyn(0xF6F5F3, 0x000000)
    static let surface   = dyn(0xFFFFFF, 0x161616)
    static let surface2  = dyn(0xFAFAFA, 0x1C1C1C)
    static let surface3  = dyn(0xF1F0EE, 0x232323)

    static let ink       = dyn(0x0A0A0A, 0xF4F3F1)
    static let ink2      = dyn(0x2C2C2C, 0xD8D6D2)
    static let muted     = dyn(0x6D6D6D, 0x9A9A9A)
    static let faint     = dyn(0x9B9B9B, 0x6E6E6E)

    static let line      = dyn(0xE7E7E7, 0x272727)
    static let lineSoft  = dyn(0xF0EFED, 0x1F1F1F)

    static let gold      = dyn(0xC6A664, 0xD4B678)
    static let goldInk   = dyn(0x8C6E32, 0xD4B678)
    static let goldWash  = dyn(0xFAF6EC, 0x1D1A13)

    static let sale      = dyn(0xE8503A, 0xFF6A52)
    static let ok        = dyn(0x2E7D5B, 0x4BBD8B)
    static let onInk     = dyn(0xFFFFFF, 0x0A0A0A)
}

extension UIColor {
    convenience init(hex: UInt32) {
        self.init(
            red:   CGFloat((hex >> 16) & 0xFF) / 255,
            green: CGFloat((hex >> 8) & 0xFF) / 255,
            blue:  CGFloat(hex & 0xFF) / 255,
            alpha: 1
        )
    }
}

/// Montserrat для заголовков и цифр, системный шрифт для мелкого текста интерфейса.
enum Typo {
    static func display(_ size: CGFloat) -> Font { .custom("Montserrat-SemiBold", size: size) }
    static func bold(_ size: CGFloat) -> Font    { .custom("Montserrat-Bold", size: size) }
    static func semi(_ size: CGFloat) -> Font    { .custom("Montserrat-SemiBold", size: size) }
    static func medium(_ size: CGFloat) -> Font  { .custom("Montserrat-Medium", size: size) }
    static func regular(_ size: CGFloat) -> Font { .custom("Montserrat-Regular", size: size) }
    static func light(_ size: CGFloat) -> Font   { .custom("Montserrat-Light", size: size) }
}

enum Metrics {
    static let pad: CGFloat = 16
    static let radius: CGFloat = 14
    static let radiusSm: CGFloat = 10
    static let radiusLg: CGFloat = 20
}

// MARK: - Повторяющиеся элементы оформления

/// Надзаголовок вразрядку — «BYRAIN И ТОП-БРЕНДЫ».
struct Eyebrow: View {
    let text: String
    var color: Color = Palette.muted
    var body: some View {
        Text(text.uppercased())
            .font(Typo.semi(10))
            .tracking(1.4)
            .foregroundStyle(color)
    }
}

struct SectionHeader: View {
    let title: String
    var link: String?
    var action: (() -> Void)?

    var body: some View {
        HStack(alignment: .firstTextBaseline) {
            Text(title)
                .font(Typo.semi(21))
                .tracking(-0.4)
                .foregroundStyle(Palette.ink)
            Spacer()
            if let link, let action {
                Button(link, action: action)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundStyle(Palette.muted)
            }
        }
        .padding(.horizontal, Metrics.pad)
        .padding(.bottom, 12)
    }
}

/// Кнопка во всю ширину с тремя вариантами оформления.
struct BigButton: View {
    enum Kind { case primary, gold, ghost, outline }
    let title: String
    var icon: String?
    var kind: Kind = .primary
    var enabled: Bool = true
    let action: () -> Void

    var body: some View {
        Button {
            Haptics.press()
            action()
        } label: {
            HStack(spacing: 8) {
                if let icon { Image(systemName: icon).font(.system(size: 15, weight: .semibold)) }
                Text(title).font(Typo.semi(15))
            }
            .frame(maxWidth: .infinity, minHeight: 52)
            .foregroundStyle(fg)
            .background(bg)
            .clipShape(RoundedRectangle(cornerRadius: Metrics.radiusSm, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: Metrics.radiusSm, style: .continuous)
                    .strokeBorder(kind == .outline ? Palette.line : .clear, lineWidth: 1)
            )
        }
        .buttonStyle(PressStyle())
        .disabled(!enabled)
        .opacity(enabled ? 1 : 0.4)
    }

    private var fg: Color {
        switch kind {
        case .primary: Palette.onInk
        case .gold:    .white
        case .ghost, .outline: Palette.ink
        }
    }

    @ViewBuilder private var bg: some View {
        switch kind {
        case .primary: Palette.ink
        case .gold:    LinearGradient(colors: [Palette.gold, Color(UIColor(hex: 0xB8955A))],
                                      startPoint: .topLeading, endPoint: .bottomTrailing)
        case .ghost:   Palette.surface3
        case .outline: Palette.surface
        }
    }
}

/// Лёгкое сжатие при нажатии — как в системных элементах.
struct PressStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.975 : 1)
            .animation(.spring(duration: 0.22), value: configuration.isPressed)
    }
}

struct Note: View {
    let text: String
    var body: some View {
        Text(text)
            .font(.system(size: 12))
            .foregroundStyle(Palette.muted)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(12)
            .background(Palette.surface2, in: RoundedRectangle(cornerRadius: Metrics.radiusSm, style: .continuous))
    }
}
