import SwiftUI

struct CartView: View {
    @Environment(AppState.self) private var state
    @Environment(Router.self) private var router

    @State private var touched = false
    @State private var paying = false
    @State private var placed: Order?

    private var delivery: Delivery {
        Delivery(rawValue: state.profile.delivery) ?? .courier
    }

    private var totals: (club: Int, rrp: Int, saved: Int) { state.cartTotals }
    private var grand: Int { totals.club + delivery.price }

    private var errors: (name: Bool, phone: Bool, address: Bool) {
        (state.profile.name.trimmingCharacters(in: .whitespaces).count < 2,
         state.profile.phone.filter(\.isNumber).count < 10,
         delivery != .pickup && state.profile.address.trimmingCharacters(in: .whitespaces).count < 6)
    }
    private var valid: Bool { !errors.name && !errors.phone && !errors.address }

    var body: some View {
        Group {
            if let placed {
                success(placed)
            } else if state.cart.isEmpty {
                empty
            } else {
                form
            }
        }
        .background(Palette.bg)
    }

    // MARK: Пустая

    private var empty: some View {
        ScrollView {
            VStack(spacing: 0) {
                EmptyStateView(
                    icon: "bag",
                    title: "Корзина пуста",
                    text: "Клубные цены на всю косметику BYRAIN — минус 50% от цены с полки.",
                    actionTitle: "Открыть каталог"
                ) { router.switchTo(.catalog) }

                SectionHeader(title: "Хиты клуба")
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(alignment: .top, spacing: 10) {
                        ForEach(Catalog.hits) { ProductCard(product: $0).frame(width: 150) }
                    }
                    .padding(.horizontal, Metrics.pad)
                }
                .scrollClipDisabled()
            }
            .padding(.bottom, 28)
        }
    }

    // MARK: Оформление

    private var form: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                ForEach(state.cartLines, id: \.product.id) { line in
                    row(line.product, qty: line.qty)
                    Divider()
                }

                SavingStrip {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(state.isMember ? "Экономия на этом заказе" : "Сэкономите, вступив в клуб")
                            .font(.system(size: 11)).foregroundStyle(Palette.goldInk)
                        Text(Money.string(totals.saved))
                            .font(Typo.bold(16)).monospacedDigit().foregroundStyle(Palette.goldInk)
                    }
                }
                .padding(.top, 16)

                if !state.isMember {
                    BigButton(title: "Вступить и сэкономить \(Money.string(totals.saved))",
                              icon: "crown.fill", kind: .gold) {
                        router.go(.join)
                    }
                    .padding(.top, 11)
                }

                Eyebrow(text: "Доставка").padding(.top, 24)
                VStack(spacing: 8) {
                    ForEach(Delivery.allCases) { option in
                        deliveryRow(option)
                    }
                }
                .padding(.top, 9)

                Eyebrow(text: "Получатель").padding(.top, 24)
                VStack(spacing: 11) {
                    field("Имя и фамилия", text: Binding(get: { state.profile.name },
                                                          set: { state.profile.name = $0; state.save() }),
                          prompt: "Как в документах", bad: touched && errors.name)
                    field("Телефон", text: Binding(get: { state.profile.phone },
                                                    set: { state.profile.phone = $0; state.save() }),
                          prompt: "+7 900 000-00-00", keyboard: .phonePad, bad: touched && errors.phone)
                    field("E-mail", text: Binding(get: { state.profile.email },
                                                   set: { state.profile.email = $0; state.save() }),
                          prompt: "для чека", keyboard: .emailAddress)
                    if delivery != .pickup {
                        field("Адрес доставки", text: Binding(get: { state.profile.address },
                                                               set: { state.profile.address = $0; state.save() }),
                              prompt: "Город, улица, дом, квартира", bad: touched && errors.address)
                    }
                }
                .padding(.top, 9)

                summary.padding(.top, 24)

                BigButton(title: paying ? "Оплата…"
                          : state.isMember ? "Оплатить \(Money.string(grand))" : "Вступить и оплатить",
                          enabled: !paying) {
                    pay()
                }
                .padding(.top, 16)

                if Payments.isDemo {
                    Note(text: "Демо: оплата товаров имитируется. В боевом контуре — Apple Pay "
                         + "или карта через платёжного провайдера, напрямую на расчётный счёт.")
                        .padding(.top, 12)
                }
            }
            .padding(.horizontal, Metrics.pad)
            .padding(.top, 12)
            .padding(.bottom, 30)
        }
    }

    private func row(_ p: Product, qty: Int) -> some View {
        HStack(alignment: .top, spacing: 12) {
            Button { router.go(.product(p.id)) } label: {
                BundleImage(path: p.cover, mode: .fit)
                    .frame(width: 72, height: 72)
                    .background(Palette.surface2)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
            }
            .buttonStyle(.plain)

            VStack(alignment: .leading, spacing: 5) {
                HStack(alignment: .top) {
                    Text(p.title)
                        .font(.system(size: 12.5, weight: .medium))
                        .foregroundStyle(Palette.ink)
                        .lineLimit(2)
                    Spacer()
                    Button { state.remove(p.id) } label: {
                        Image(systemName: "trash")
                            .font(.system(size: 14))
                            .foregroundStyle(Palette.faint)
                    }
                    .buttonStyle(.plain)
                }
                HStack(alignment: .firstTextBaseline, spacing: 7) {
                    Text(Money.string(p.club)).font(Typo.bold(14)).monospacedDigit()
                        .foregroundStyle(Palette.ink)
                    Text(Money.string(p.rrp)).font(Typo.regular(12)).strikethrough()
                        .foregroundStyle(Palette.faint)
                }
                QtyStepper(value: Binding(get: { qty }, set: { state.setQty(p.id, $0) }), min: 0)
                    .padding(.top, 4)
            }
        }
        .padding(.vertical, 14)
    }

    private func deliveryRow(_ option: Delivery) -> some View {
        let on = delivery == option
        return Button {
            Haptics.select()
            state.profile.delivery = option.rawValue
            state.save()
        } label: {
            HStack(spacing: 11) {
                Image(systemName: on ? "largecircle.fill.circle" : "circle")
                    .font(.system(size: 19))
                    .foregroundStyle(on ? Palette.ink : Palette.line)
                VStack(alignment: .leading, spacing: 1) {
                    Text(option.title).font(.system(size: 13.5, weight: .medium)).foregroundStyle(Palette.ink)
                    Text(option.subtitle).font(.system(size: 11)).foregroundStyle(Palette.muted)
                }
                Spacer()
                Text(option.price > 0 ? Money.string(option.price) : "бесплатно")
                    .font(Typo.semi(13)).monospacedDigit()
                    .foregroundStyle(Palette.ink)
            }
            .padding(13)
            .background(on ? Palette.surface2 : Palette.surface,
                        in: RoundedRectangle(cornerRadius: Metrics.radiusSm, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: Metrics.radiusSm, style: .continuous)
                .strokeBorder(on ? Palette.ink : Palette.line, lineWidth: 1))
        }
        .buttonStyle(.plain)
    }

    private var summary: some View {
        VStack(spacing: 0) {
            Divider().padding(.bottom, 6)
            line("Товары по РРЦ", Money.string(totals.rrp), strike: true)
            line("Клубная цена", Money.string(totals.club))
            line("Выгода клуба", "−" + Money.string(totals.saved), gold: true)
            line("Доставка", delivery.price > 0 ? Money.string(delivery.price) : "бесплатно")
            Divider().padding(.top, 8)
            HStack {
                Text("К оплате").font(Typo.bold(16)).foregroundStyle(Palette.ink)
                Spacer()
                Text(Money.string(grand)).font(Typo.bold(16)).monospacedDigit()
                    .foregroundStyle(Palette.ink)
            }
            .padding(.top, 13)
        }
    }

    private func line(_ label: String, _ value: String, strike: Bool = false, gold: Bool = false) -> some View {
        HStack {
            Text(label).font(.system(size: 13.5))
                .foregroundStyle(gold ? Palette.goldInk : Palette.muted)
            Spacer()
            Text(value)
                .font(gold ? Typo.semi(13.5) : Typo.medium(13.5))
                .monospacedDigit()
                .strikethrough(strike)
                .foregroundStyle(gold ? Palette.goldInk : (strike ? Palette.faint : Palette.ink))
        }
        .padding(.vertical, 7)
    }

    private func field(_ label: String, text: Binding<String>, prompt: String,
                       keyboard: UIKeyboardType = .default, bad: Bool = false) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label.uppercased())
                .font(.system(size: 11, weight: .semibold)).tracking(0.4)
                .foregroundStyle(Palette.muted)
            TextField(prompt, text: text)
                .keyboardType(keyboard)
                .textInputAutocapitalization(keyboard == .emailAddress ? .never : .sentences)
                .font(.system(size: 15))
                .padding(.horizontal, 13).frame(height: 46)
                .background(Palette.surface, in: RoundedRectangle(cornerRadius: Metrics.radiusSm))
                .overlay(RoundedRectangle(cornerRadius: Metrics.radiusSm)
                    .strokeBorder(bad ? Palette.sale : Palette.line, lineWidth: 1))
        }
    }

    // MARK: Успех

    private func success(_ order: Order) -> some View {
        ScrollView {
            VStack(spacing: 0) {
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 54))
                    .foregroundStyle(Palette.gold)
                    .padding(.top, 36)
                Text("Заказ \(order.id) оплачен")
                    .font(Typo.semi(21)).foregroundStyle(Palette.ink)
                    .padding(.top, 18)
                Text("Подтверждение придёт на почту. Сэкономлено \(Money.string(order.saved)).")
                    .font(.system(size: 13)).foregroundStyle(Palette.muted)
                    .multilineTextAlignment(.center)
                    .padding(.top, 9)

                VStack(spacing: 0) {
                    ForEach(Array(order.lines.enumerated()), id: \.offset) { _, l in
                        HStack {
                            Text(l.title).font(.system(size: 13)).foregroundStyle(Palette.ink).lineLimit(1)
                            Spacer()
                            Text("\(l.qty) × \(Money.string(l.price))")
                                .font(.system(size: 12)).monospacedDigit().foregroundStyle(Palette.muted)
                        }
                        .padding(14)
                        Divider().padding(.leading, 14)
                    }
                    HStack {
                        Text("Итого").font(Typo.semi(14)).foregroundStyle(Palette.ink)
                        Spacer()
                        Text(Money.string(order.total)).font(Typo.bold(14)).monospacedDigit()
                            .foregroundStyle(Palette.ink)
                    }
                    .padding(14)
                }
                .background(Palette.surface, in: RoundedRectangle(cornerRadius: Metrics.radius))
                .overlay(RoundedRectangle(cornerRadius: Metrics.radius).strokeBorder(Palette.line, lineWidth: 1))
                .padding(.top, 20)

                BigButton(title: "Продолжить покупки") {
                    placed = nil
                    router.switchTo(.home)
                }
                .padding(.top, 18)

                BigButton(title: "Мои заказы", kind: .ghost) {
                    placed = nil
                    router.reset(.profile)
                    router.go(.orders)
                }
                .padding(.top, 10)
            }
            .padding(Metrics.pad)
        }
    }

    private func pay() {
        touched = true
        guard state.isMember else { router.go(.join); return }
        guard valid else { Haptics.error(); state.say("Заполните контакты и адрес"); return }

        paying = true
        Task {
            let result = await Payments.payOrder(
                amount: grand,
                lines: state.cartLines.map { ($0.product.id, $0.qty) }
            )
            paying = false
            switch result {
            case .paid:
                withAnimation(.spring(duration: 0.35)) { placed = state.placeOrder(shipping: delivery.price) }
            case .cancelled:
                break
            case .failed(let message):
                Haptics.error()
                state.say(message)
            }
        }
    }
}
