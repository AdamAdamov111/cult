import SwiftUI

struct JoinView: View {
    @Environment(AppState.self) private var state
    @Environment(Router.self) private var router
    @Environment(MembershipStore.self) private var store
    @Environment(\.dismiss) private var dismiss

    @State private var busy = false

    private var flagship: Product? {
        Catalog.onSale.filter { $0.cat != "set" }.max { $0.rrp < $1.rrp }
    }

    private var perks: [(icon: String, title: String, text: String)] {
        [("crown.fill",
          "Вся косметика BYRAIN −50% от РРЦ",
          "\(Catalog.products(brand: "BYRAIN").count) позиций: кремы, сыворотки, маски, ампулы. Клубная цена на весь ассортимент без исключений."),
         ("sparkles",
          "Топ-бренды косметики по клубным ценам",
          "GREYMY, ORIBE и KEVIN MURPHY — цены, которых нет в рознице."),
         ("ticket.fill",
          "\(Catalog.offers.count) предложений партнёров в четырёх сферах",
          "Спорт, travel, красота и здоровье. Промокод, QR или заявка прямо в приложении.")]
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                hero
                if state.isMember {
                    BigButton(title: "Перейти к покупкам") { router.popToRoot() }
                        .padding(Metrics.pad)
                } else {
                    math.padding(.horizontal, Metrics.pad).padding(.top, 16)
                    perksList.padding(.horizontal, Metrics.pad).padding(.top, 8)
                    price.padding(.horizontal, Metrics.pad)
                }
            }
            .padding(.bottom, 30)
        }
        .background(Palette.bg)
        .navigationTitle("Членство CULT")
        .navigationBarTitleDisplayMode(.inline)
        .task { await store.load() }
    }

    private var hero: some View {
        ZStack {
            LinearGradient(colors: [Color(UIColor(hex: 0x0A0A0A)),
                                    Color(UIColor(hex: 0x1C1B18)),
                                    Color(UIColor(hex: 0x2A2520))],
                           startPoint: .top, endPoint: .bottomTrailing)
            Circle()
                .fill(RadialGradient(colors: [Palette.gold.opacity(0.3), .clear],
                                     center: .center, startRadius: 0, endRadius: 150))
                .frame(width: 300, height: 300)
                .offset(y: -130)

            VStack(spacing: 0) {
                Text("CULT")
                    .font(Typo.bold(30)).tracking(11)
                    .foregroundStyle(.white)
                Text(state.isMember ? "ВЫ ЧЛЕН КЛУБА" : "ЗАКРЫТЫЙ КЛУБ BYRAIN")
                    .font(Typo.semi(11)).tracking(3)
                    .foregroundStyle(Palette.gold)
                    .padding(.top, 11)
                if !state.isMember {
                    Text("Членство \(Money.string(Catalog.membershipPrice)) в месяц\nвозвращает себя первой покупкой")
                        .font(Typo.medium(19))
                        .foregroundStyle(.white)
                        .multilineTextAlignment(.center)
                        .lineSpacing(4)
                        .padding(.top, 18)
                }
            }
            .padding(.vertical, 30)
            .padding(.horizontal, Metrics.pad)
        }
        .clipped()
    }

    @ViewBuilder private var math: some View {
        let totals = state.cartTotals
        SavingStrip {
            if totals.club > 0 {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Экономия на вашей корзине")
                        .font(.system(size: 11)).foregroundStyle(Palette.goldInk)
                    Text(Money.string(totals.saved))
                        .font(Typo.bold(16)).monospacedDigit().foregroundStyle(Palette.goldInk)
                    Text("вместо \(Money.string(totals.rrp)) заплатите \(Money.string(totals.club))")
                        .font(.system(size: 11)).foregroundStyle(Palette.muted)
                }
            } else if let f = flagship {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Пример выгоды")
                        .font(.system(size: 11)).foregroundStyle(Palette.goldInk)
                    Text(f.title)
                        .font(Typo.semi(14)).foregroundStyle(Palette.ink)
                        .fixedSize(horizontal: false, vertical: true)
                    Text("\(Money.string(f.club)) в клубе вместо \(Money.string(f.rrp)) с полки — минус \(Money.string(f.saving))")
                        .font(.system(size: 11)).foregroundStyle(Palette.muted)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
        }
    }

    private var perksList: some View {
        VStack(spacing: 0) {
            ForEach(Array(perks.enumerated()), id: \.offset) { _, perk in
                HStack(alignment: .top, spacing: 13) {
                    Image(systemName: perk.icon)
                        .font(.system(size: 16))
                        .foregroundStyle(Palette.goldInk)
                        .frame(width: 36, height: 36)
                        .background(Palette.goldWash, in: Circle())
                    VStack(alignment: .leading, spacing: 3) {
                        Text(perk.title).font(Typo.semi(14)).foregroundStyle(Palette.ink)
                            .fixedSize(horizontal: false, vertical: true)
                        Text(perk.text).font(.system(size: 12)).foregroundStyle(Palette.muted)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    Spacer(minLength: 0)
                }
                .padding(.vertical, 15)
                Divider()
            }
        }
    }

    private var price: some View {
        VStack(spacing: 0) {
            Text(store.priceText)
                .font(Typo.bold(38)).monospacedDigit().tracking(-1)
                .foregroundStyle(Palette.ink)
                .padding(.top, 22)
            Text("в месяц · автопродление · отмена в любой момент")
                .font(.system(size: 13)).foregroundStyle(Palette.muted)
                .padding(.top, 2)

            BigButton(title: busy ? "Оформляем…" : "Вступить за \(store.priceText)",
                      icon: "crown.fill", kind: .gold, enabled: !busy) {
                subscribe()
            }
            .padding(.top, 20)

            Button("Восстановить покупки") {
                Task { await store.restore(); await refresh() }
            }
            .font(.system(size: 13))
            .foregroundStyle(Palette.muted)
            .padding(.top, 14)

            VStack(alignment: .leading, spacing: 7) {
                ForEach([
                    "Списание раз в месяц, отменить можно в настройках Apple ID",
                    "Доступ к клубным ценам открывается сразу",
                    "Суммарная выгода по предложениям партнёров — до \(Money.string(Catalog.totalOfferValue)) в год",
                ], id: \.self) { line in
                    HStack(alignment: .top, spacing: 8) {
                        Image(systemName: "checkmark")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundStyle(Palette.gold).padding(.top, 3)
                        Text(line).font(.system(size: 12)).foregroundStyle(Palette.muted)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.top, 18)

            if case .unavailable = store.status {
                Note(text: "Подписка ещё не заведена в App Store Connect. "
                     + "В сборке для симулятора используется локальный файл конфигурации StoreKit, "
                     + "поэтому покупка проходит в тестовом режиме.")
                    .padding(.top, 16)
            }
        }
    }

    private func subscribe() {
        busy = true
        Task {
            // Без магазина (локальная проверка) выдаём членство напрямую.
            guard store.product != nil else {
                try? await Task.sleep(for: .milliseconds(600))
                state.grantMembership()
                busy = false
                Haptics.success()
                state.say("Добро пожаловать в CULT")
                finish()
                return
            }
            let result = await store.purchase()
            busy = false
            switch result {
            case .success:
                await refresh()
                Haptics.success()
                state.say("Добро пожаловать в CULT")
                finish()
            case .cancelled:
                break
            case .pending:
                state.say("Покупка ожидает подтверждения")
            case .failed(let message):
                Haptics.error()
                state.say(message)
            }
        }
    }

    private func refresh() async {
        if let entitlement = await store.currentEntitlement() {
            state.setMembership(expiry: entitlement.expiry, autoRenew: entitlement.autoRenew)
        } else {
            state.grantMembership()
        }
    }

    private func finish() {
        if state.cartCount > 0 {
            router.reset(.cart)
        } else {
            router.popToRoot()
        }
    }
}
