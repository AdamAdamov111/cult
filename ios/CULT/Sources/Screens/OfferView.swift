import SwiftUI

struct OfferView: View {
    let offerId: String
    @Environment(AppState.self) private var state
    @Environment(Router.self) private var router

    @State private var showCoupon = false
    @State private var showRequest = false

    var body: some View {
        if let offer = Catalog.offer(offerId) {
            let coupon = state.coupon(for: offer.id)

            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    hero(offer)

                    Text(offer.summary)
                        .font(.system(size: 14))
                        .foregroundStyle(Palette.ink)
                        .lineSpacing(3)
                        .fixedSize(horizontal: false, vertical: true)
                        .padding(.horizontal, Metrics.pad)
                        .padding(.top, 16)

                    if let value = offer.value {
                        SavingStrip(icon: "crown") {
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Выгода по предложению")
                                    .font(.system(size: 11)).foregroundStyle(Palette.goldInk)
                                Text("до \(Money.string(value))")
                                    .font(Typo.bold(16)).monospacedDigit()
                                    .foregroundStyle(Palette.goldInk)
                            }
                        }
                        .padding(.horizontal, Metrics.pad)
                        .padding(.top, 15)
                    }

                    terms(offer)
                    facts(offer)

                    if let coupon {
                        couponPreview(coupon).padding(.top, 18)
                    }

                    actions(offer, coupon: coupon).padding(.top, 18)
                }
                .padding(.bottom, 30)
            }
            .background(Palette.bg)
            .navigationTitle(offer.brand)
            .navigationBarTitleDisplayMode(.inline)
            .sheet(isPresented: $showCoupon) {
                if let c = state.coupon(for: offer.id) {
                    CouponSheet(coupon: c)
                        .presentationDetents([.large])
                        .presentationDragIndicator(.visible)
                }
            }
            .sheet(isPresented: $showRequest) {
                RequestSheet(offer: offer)
                    .presentationDetents([.large])
                    .presentationDragIndicator(.visible)
            }
        } else {
            EmptyStateView(icon: "questionmark", title: "Предложение не найдено")
        }
    }

    private func hero(_ offer: Offer) -> some View {
        ZStack(alignment: .bottomLeading) {
            BundleImage(path: offer.image)
                .aspectRatio(16.0 / 10.0, contentMode: .fill)
            LinearGradient(
                stops: [.init(color: .black.opacity(0.84), location: 0.04),
                        .init(color: .black.opacity(0.4), location: 0.5),
                        .init(color: .black.opacity(0.08), location: 0.9)],
                startPoint: .bottom, endPoint: .top)
            VStack(alignment: .leading, spacing: 3) {
                Eyebrow(text: offer.brand, color: Palette.gold)
                Text(offer.title)
                    .font(Typo.semi(23)).tracking(-0.4)
                    .foregroundStyle(.white)
                    .fixedSize(horizontal: false, vertical: true)
                Text("\(offer.deal) для членов клуба")
                    .font(Typo.bold(13))
                    .foregroundStyle(.black)
                    .padding(.horizontal, 11).frame(height: 27)
                    .background(.white, in: RoundedRectangle(cornerRadius: 6))
                    .padding(.top, 9)
            }
            .padding(Metrics.pad)
        }
    }

    private func terms(_ offer: Offer) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Eyebrow(text: "Условия")
            ForEach(Array(offer.terms.enumerated()), id: \.offset) { _, term in
                HStack(alignment: .top, spacing: 9) {
                    Image(systemName: "checkmark")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundStyle(Palette.gold)
                        .padding(.top, 2)
                    Text(term)
                        .font(.system(size: 13))
                        .foregroundStyle(Palette.ink2)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
        }
        .padding(.horizontal, Metrics.pad)
        .padding(.top, 22)
    }

    private func facts(_ offer: Offer) -> some View {
        VStack(spacing: 0) {
            if let address = offer.address {
                row("mappin.and.ellipse", "Адрес", address)
                Divider().padding(.leading, 44)
            }
            row("clock", "Действует", offer.valid)
            Divider().padding(.leading, 44)
            row("ticket", "Как получить", offer.needsRequest ? "заявка менеджеру" : "промокод или QR")
        }
        .background(Palette.surface, in: RoundedRectangle(cornerRadius: Metrics.radius, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: Metrics.radius, style: .continuous)
            .strokeBorder(Palette.line, lineWidth: 1))
        .padding(.horizontal, Metrics.pad)
        .padding(.top, 18)
    }

    private func row(_ icon: String, _ label: String, _ value: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon).font(.system(size: 15)).foregroundStyle(Palette.muted).frame(width: 20)
            Text(label).font(.system(size: 13.5, weight: .medium)).foregroundStyle(Palette.ink)
            Spacer(minLength: 12)
            Text(value)
                .font(.system(size: 13)).foregroundStyle(Palette.muted)
                .multilineTextAlignment(.trailing)
        }
        .padding(14)
    }

    private func couponPreview(_ coupon: Coupon) -> some View {
        Button { showCoupon = true } label: {
            HStack(spacing: 12) {
                Image(systemName: "ticket.fill").foregroundStyle(Palette.gold)
                VStack(alignment: .leading, spacing: 2) {
                    Text("Ваш промокод активен")
                        .font(.system(size: 11)).foregroundStyle(Palette.muted)
                    Text(coupon.code)
                        .font(Typo.bold(13)).tracking(1).monospacedDigit()
                        .foregroundStyle(Palette.ink)
                }
                Spacer()
                Text("Открыть").font(Typo.semi(13)).foregroundStyle(Palette.ink)
                    .padding(.horizontal, 12).frame(height: 34)
                    .background(Palette.surface3, in: Capsule())
            }
            .padding(13)
            .background(Palette.surface2, in: RoundedRectangle(cornerRadius: Metrics.radiusSm, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: Metrics.radiusSm, style: .continuous)
                .strokeBorder(Palette.line, style: StrokeStyle(lineWidth: 1, dash: [4, 3])))
        }
        .buttonStyle(PressStyle())
        .padding(.horizontal, Metrics.pad)
    }

    @ViewBuilder private func actions(_ offer: Offer, coupon: Coupon?) -> some View {
        VStack(spacing: 10) {
            if state.isMember {
                BigButton(title: offer.needsRequest ? "Оставить заявку"
                          : coupon != nil ? "Показать промокод" : "Получить предложение") {
                    if offer.needsRequest {
                        showRequest = true
                    } else {
                        state.issueCoupon(for: offer)
                        showCoupon = true
                    }
                }
            } else {
                BigButton(title: "Вступить в CULT · \(Money.string(Catalog.membershipPrice))",
                          icon: "crown.fill", kind: .gold) {
                    router.go(.join)
                }
                Note(text: "Предложение доступно только членам клуба. "
                     + "Членство окупается одной покупкой косметики BYRAIN.")
            }
        }
        .padding(.horizontal, Metrics.pad)
    }
}

// MARK: - Промокод с QR

struct CouponSheet: View {
    let coupon: Coupon
    @Environment(AppState.self) private var state
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                VStack(spacing: 0) {
                    Text("CULT").font(Typo.bold(13)).tracking(5).foregroundStyle(.white)
                    Eyebrow(text: coupon.brand, color: Palette.gold).padding(.top, 7)
                    Text("\(coupon.deal) · \(coupon.title)")
                        .font(Typo.semi(15))
                        .foregroundStyle(.white)
                        .multilineTextAlignment(.center)
                        .padding(.top, 5)

                    Text(coupon.code)
                        .font(Typo.bold(19)).tracking(1.6).monospacedDigit()
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding(15)
                        .overlay(RoundedRectangle(cornerRadius: Metrics.radiusSm)
                            .strokeBorder(.white.opacity(0.3), style: StrokeStyle(lineWidth: 1, dash: [5, 4])))
                        .padding(.top, 14)

                    QRView(value: coupon.code, size: 150).padding(.top, 12)

                    Text("Действует до \(coupon.expires.formatted(.dateTime.day().month().year()))")
                        .font(.system(size: 11))
                        .foregroundStyle(.white.opacity(0.6))
                        .padding(.top, 12)
                }
                .padding(20)
                .frame(maxWidth: .infinity)
                .background(
                    LinearGradient(colors: [Color(UIColor(hex: 0x0A0A0A)), Color(UIColor(hex: 0x272320))],
                                   startPoint: .topLeading, endPoint: .bottomTrailing)
                )
                .clipShape(RoundedRectangle(cornerRadius: Metrics.radius, style: .continuous))

                BigButton(title: "Скопировать код", icon: "doc.on.doc", kind: .ghost) {
                    UIPasteboard.general.string = coupon.code
                    Haptics.success()
                    state.say("Промокод скопирован")
                }
                .padding(.top, 12)

                Note(text: "Назовите код или покажите QR администратору \(coupon.brand). "
                     + "Код привязан к вашему членству.")
                    .padding(.top, 10)
            }
            .padding(Metrics.pad)
        }
        .background(Palette.bg)
    }
}

// MARK: - Заявка

struct RequestSheet: View {
    let offer: Offer
    @Environment(AppState.self) private var state
    @Environment(\.dismiss) private var dismiss

    @State private var name = ""
    @State private var phone = ""
    @State private var dates = ""
    @State private var comment = ""
    @State private var sent = false

    private var valid: Bool {
        name.trimmingCharacters(in: .whitespaces).count >= 2
        && phone.filter(\.isNumber).count >= 10
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                if sent {
                    VStack(spacing: 0) {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 48))
                            .foregroundStyle(Palette.ok)
                        Text("Заявка принята")
                            .font(Typo.semi(19)).foregroundStyle(Palette.ink)
                            .padding(.top, 14)
                        Text("Менеджер клуба свяжется с вами в течение дня по предложению «\(offer.title)».")
                            .font(.system(size: 13))
                            .foregroundStyle(Palette.muted)
                            .multilineTextAlignment(.center)
                            .padding(.top, 8)
                        BigButton(title: "Готово") { dismiss() }
                            .padding(.top, 22)
                    }
                    .padding(Metrics.pad)
                    .padding(.top, 30)
                } else {
                    VStack(spacing: 12) {
                        field("Имя", text: $name, prompt: "Как к вам обращаться")
                        field("Телефон", text: $phone, prompt: "+7 ...", keyboard: .phonePad)
                        field("Желаемые даты", text: $dates, prompt: "например, вторая половина марта")
                        field("Комментарий", text: $comment, prompt: "Состав участников, пожелания")

                        BigButton(title: "Отправить заявку", enabled: valid) {
                            Haptics.success()
                            withAnimation(.spring(duration: 0.35)) { sent = true }
                        }
                        .padding(.top, 6)

                        Note(text: "Данные уходят менеджеру клуба. "
                             + "Предложение закрепляется за вами на 48 часов.")
                    }
                    .padding(Metrics.pad)
                }
            }
            .background(Palette.bg)
            .navigationTitle(sent ? "Заявка принята" : "Заявка на подбор")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Закрыть") { dismiss() }
                }
            }
            .onAppear {
                if name.isEmpty { name = state.profile.name }
                if phone.isEmpty { phone = state.profile.phone }
            }
        }
    }

    private func field(_ label: String, text: Binding<String>, prompt: String,
                       keyboard: UIKeyboardType = .default) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label.uppercased())
                .font(.system(size: 11, weight: .semibold)).tracking(0.4)
                .foregroundStyle(Palette.muted)
            TextField(prompt, text: text)
                .keyboardType(keyboard)
                .font(.system(size: 15))
                .padding(.horizontal, 13).frame(height: 46)
                .background(Palette.surface, in: RoundedRectangle(cornerRadius: Metrics.radiusSm))
                .overlay(RoundedRectangle(cornerRadius: Metrics.radiusSm)
                    .strokeBorder(Palette.line, lineWidth: 1))
        }
    }
}
