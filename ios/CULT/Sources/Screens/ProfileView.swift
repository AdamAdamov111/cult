import SwiftUI

struct ProfileView: View {
    @Environment(AppState.self) private var state
    @Environment(Router.self) private var router
    @Environment(\.openURL) private var openURL

    @State private var editing = false
    @State private var confirmCancel = false

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                membershipCard.padding(.horizontal, Metrics.pad).padding(.top, 14)

                Eyebrow(text: "Контакты и доставка")
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal, Metrics.pad).padding(.top, 24)

                list {
                    rowButton("Имя", state.profile.name.isEmpty ? "не указано" : state.profile.name) { editing = true }
                    Divider().padding(.leading, Metrics.pad)
                    rowButton("Телефон", state.profile.phone.isEmpty ? "не указан" : state.profile.phone) { editing = true }
                    Divider().padding(.leading, Metrics.pad)
                    rowButton("E-mail", state.profile.email.isEmpty ? "не указан" : state.profile.email) { editing = true }
                    Divider().padding(.leading, Metrics.pad)
                    rowButton("Адрес", state.profile.address.isEmpty ? "не указан" : state.profile.address) { editing = true }
                }
                .padding(.horizontal, Metrics.pad).padding(.top, 9)

                list {
                    rowButton("История заказов", "\(state.orders.count)") { router.go(.orders) }
                    Divider().padding(.leading, Metrics.pad)
                    rowButton("Промокоды и купоны", "\(state.coupons.count)") { router.go(.coupons) }
                    Divider().padding(.leading, Metrics.pad)
                    rowButton("Избранное", "\(state.favorites.count)", chevron: false) {}
                    Divider().padding(.leading, Metrics.pad)
                    rowButton("Поддержка клуба", "", icon: "arrow.up.right") {
                        if let url = URL(string: "https://t.me/byrain_support") { openURL(url) }
                    }
                }
                .padding(.horizontal, Metrics.pad).padding(.top, 20)

                Note(text: "Клубные цены действуют, пока активно членство. "
                     + "Заказы и промокоды хранятся на этом устройстве.")
                    .padding(.horizontal, Metrics.pad).padding(.top, 20)

                Button("Сбросить демо-состояние") { state.resetAll() }
                    .font(.system(size: 12))
                    .foregroundStyle(Palette.faint)
                    .padding(.top, 22)

                Text("CULT 1.0 · закрытый клуб BYRAIN")
                    .font(.system(size: 11)).foregroundStyle(Palette.faint)
                    .padding(.top, 8)
            }
            .padding(.bottom, 30)
        }
        .background(Palette.bg)
        .sheet(isPresented: $editing) { ProfileEditor() }
        .confirmationDialog("Отключить автопродление?",
                            isPresented: $confirmCancel, titleVisibility: .visible) {
            Button("Отключить", role: .destructive) { state.cancelAutoRenew() }
            Button("Оставить", role: .cancel) {}
        } message: {
            Text("Клубные цены будут действовать до конца оплаченного периода.")
        }
    }

    @ViewBuilder private var membershipCard: some View {
        let card = ZStack(alignment: .topTrailing) {
            LinearGradient(colors: [Color(UIColor(hex: 0x0A0A0A)), Color(UIColor(hex: 0x26231D))],
                           startPoint: .topLeading, endPoint: .bottomTrailing)
            Circle()
                .fill(RadialGradient(colors: [Palette.gold.opacity(0.34), .clear],
                                     center: .center, startRadius: 0, endRadius: 100))
                .frame(width: 200, height: 200).offset(x: 70, y: -90)

            VStack(alignment: .leading, spacing: 0) {
                Text("CULT").font(Typo.bold(15)).tracking(4.5).foregroundStyle(.white)
                Text(state.isMember ? "ЧЛЕНСТВО АКТИВНО" : "ЧЛЕНСТВА НЕТ")
                    .font(Typo.semi(11)).tracking(1.6)
                    .foregroundStyle(Palette.gold)
                    .padding(.top, 7)

                if state.isMember {
                    Text(state.autoRenew
                         ? "Следующее списание \(Money.string(Catalog.membershipPrice)) — \(state.memberUntilText())"
                         : "Действует до \(state.memberUntilText()), автопродление отключено")
                        .font(.system(size: 12.5))
                        .foregroundStyle(.white.opacity(0.78))
                        .fixedSize(horizontal: false, vertical: true)
                        .padding(.top, 15)

                    Text("Сэкономлено в клубе")
                        .font(.system(size: 11)).foregroundStyle(.white.opacity(0.6))
                        .padding(.top, 15)
                    Text(Money.string(state.savedTotal))
                        .font(Typo.bold(24)).monospacedDigit().foregroundStyle(.white)

                    if state.autoRenew {
                        Button("Отключить автопродление") { confirmCancel = true }
                            .font(Typo.semi(13))
                            .foregroundStyle(.white)
                            .padding(.horizontal, 14).frame(height: 38)
                            .background(.white.opacity(0.12), in: Capsule())
                            .padding(.top, 15)
                    }
                } else {
                    Text("Вся косметика BYRAIN −50% и предложения партнёров — за \(Money.string(Catalog.membershipPrice)) в месяц")
                        .font(.system(size: 12.5))
                        .foregroundStyle(.white.opacity(0.78))
                        .fixedSize(horizontal: false, vertical: true)
                        .padding(.top, 15)
                    Label("Вступить в CULT", systemImage: "crown.fill")
                        .font(Typo.semi(13))
                        .foregroundStyle(.black)
                        .padding(.horizontal, 14).frame(height: 38)
                        .background(
                            LinearGradient(colors: [Palette.gold, Color(UIColor(hex: 0xB8955A))],
                                           startPoint: .leading, endPoint: .trailing),
                            in: Capsule())
                        .padding(.top, 15)
                }
            }
            .padding(19)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .clipShape(RoundedRectangle(cornerRadius: Metrics.radius, style: .continuous))

        if state.isMember {
            card
        } else {
            Button { router.go(.join) } label: { card }.buttonStyle(PressStyle())
        }
    }

    private func list<C: View>(@ViewBuilder content: () -> C) -> some View {
        VStack(spacing: 0) { content() }
            .background(Palette.surface, in: RoundedRectangle(cornerRadius: Metrics.radius, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: Metrics.radius, style: .continuous)
                .strokeBorder(Palette.line, lineWidth: 1))
    }

    private func rowButton(_ label: String, _ value: String,
                           chevron: Bool = true, icon: String = "chevron.right",
                           action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Text(label).font(.system(size: 13.5, weight: .medium)).foregroundStyle(Palette.ink)
                Spacer(minLength: 12)
                Text(value).font(.system(size: 13)).foregroundStyle(Palette.muted)
                    .lineLimit(1).truncationMode(.tail)
                if chevron {
                    Image(systemName: icon).font(.system(size: 12, weight: .semibold))
                        .foregroundStyle(Palette.faint)
                }
            }
            .padding(.horizontal, Metrics.pad).padding(.vertical, 14)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Редактор контактов

struct ProfileEditor: View {
    @Environment(AppState.self) private var state
    @Environment(\.dismiss) private var dismiss
    @State private var draft = Profile()

    var body: some View {
        NavigationStack {
            Form {
                Section("Контакты") {
                    TextField("Имя и фамилия", text: $draft.name)
                    TextField("Телефон", text: $draft.phone).keyboardType(.phonePad)
                    TextField("E-mail", text: $draft.email)
                        .keyboardType(.emailAddress).textInputAutocapitalization(.never)
                }
                Section("Доставка") {
                    TextField("Адрес", text: $draft.address, axis: .vertical).lineLimit(2...4)
                }
            }
            .navigationTitle("Контакты")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Отмена") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Сохранить") {
                        state.profile = draft
                        state.save()
                        Haptics.success()
                        dismiss()
                    }
                    .fontWeight(.semibold)
                }
            }
            .onAppear { draft = state.profile }
        }
    }
}

// MARK: - Заказы

struct OrdersView: View {
    @Environment(AppState.self) private var state
    @Environment(Router.self) private var router

    var body: some View {
        Group {
            if state.orders.isEmpty {
                EmptyStateView(icon: "shippingbox", title: "Заказов пока нет",
                               text: "Оформленные заказы появятся здесь с составом и статусом.",
                               actionTitle: "В каталог") { router.switchTo(.catalog) }
            } else {
                ScrollView {
                    VStack(spacing: 10) {
                        ForEach(state.orders) { order in card(order) }
                    }
                    .padding(Metrics.pad)
                }
            }
        }
        .background(Palette.bg)
        .navigationTitle("История заказов")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func card(_ order: Order) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack {
                Text("№ \(order.id)").font(Typo.semi(15)).foregroundStyle(Palette.ink)
                Spacer()
                Text(order.status)
                    .font(.system(size: 10.5, weight: .semibold))
                    .foregroundStyle(Palette.ok)
                    .padding(.horizontal, 8).frame(height: 21)
                    .background(Palette.ok.opacity(0.14), in: Capsule())
            }
            Text(order.date.formatted(.dateTime.day().month(.wide).hour().minute()))
                .font(.system(size: 12)).foregroundStyle(Palette.muted)
                .padding(.top, 3)

            VStack(spacing: 4) {
                ForEach(Array(order.lines.enumerated()), id: \.offset) { _, l in
                    HStack {
                        Text(l.title).font(.system(size: 12)).foregroundStyle(Palette.ink2).lineLimit(1)
                        Spacer()
                        Text("\(l.qty) × \(Money.string(l.price))")
                            .font(.system(size: 12)).monospacedDigit().foregroundStyle(Palette.muted)
                    }
                }
            }
            .padding(.top, 10)

            Divider().padding(.vertical, 10)

            HStack {
                Text("Итого").font(.system(size: 13)).foregroundStyle(Palette.ink)
                Spacer()
                Text(Money.string(order.total)).font(Typo.semi(15)).monospacedDigit()
                    .foregroundStyle(Palette.ink)
            }
            HStack {
                Text("Выгода клуба").font(.system(size: 11)).foregroundStyle(Palette.goldInk)
                Spacer()
                Text("−" + Money.string(order.saved))
                    .font(.system(size: 11, weight: .semibold)).monospacedDigit()
                    .foregroundStyle(Palette.goldInk)
            }
            .padding(.top, 2)
        }
        .padding(14)
        .background(Palette.surface, in: RoundedRectangle(cornerRadius: Metrics.radius))
        .overlay(RoundedRectangle(cornerRadius: Metrics.radius).strokeBorder(Palette.line, lineWidth: 1))
    }
}

// MARK: - Купоны

struct CouponsView: View {
    @Environment(AppState.self) private var state
    @Environment(Router.self) private var router
    @State private var shown: Coupon?

    var body: some View {
        Group {
            if state.coupons.isEmpty {
                EmptyStateView(icon: "ticket", title: "Купонов пока нет",
                               text: "Откройте предложение партнёра и нажмите «Получить предложение» — промокод появится здесь.")
            } else {
                ScrollView {
                    VStack(spacing: 10) {
                        ForEach(state.coupons) { coupon in
                            Button { shown = coupon } label: { row(coupon) }
                                .buttonStyle(PressStyle())
                        }
                    }
                    .padding(Metrics.pad)
                }
            }
        }
        .background(Palette.bg)
        .navigationTitle("Промокоды и купоны")
        .navigationBarTitleDisplayMode(.inline)
        .sheet(item: $shown) { coupon in
            CouponSheet(coupon: coupon)
                .presentationDetents([.large])
                .presentationDragIndicator(.visible)
        }
    }

    private func row(_ c: Coupon) -> some View {
        HStack(spacing: 12) {
            Image(systemName: "ticket.fill").foregroundStyle(Palette.gold)
            VStack(alignment: .leading, spacing: 2) {
                Text("\(c.brand) · \(c.deal)")
                    .font(.system(size: 11)).foregroundStyle(Palette.muted)
                Text(c.code).font(Typo.bold(13)).tracking(1).monospacedDigit()
                    .foregroundStyle(Palette.ink)
                Text(c.title).font(.system(size: 11)).foregroundStyle(Palette.muted).lineLimit(1)
                Text("до \(c.expires.formatted(.dateTime.day().month().year()))")
                    .font(.system(size: 11)).foregroundStyle(Palette.faint)
            }
            Spacer()
            Image(systemName: "chevron.right").font(.system(size: 12, weight: .semibold))
                .foregroundStyle(Palette.faint)
        }
        .padding(13)
        .background(Palette.surface2, in: RoundedRectangle(cornerRadius: Metrics.radiusSm))
        .overlay(RoundedRectangle(cornerRadius: Metrics.radiusSm)
            .strokeBorder(Palette.line, style: StrokeStyle(lineWidth: 1, dash: [4, 3])))
    }
}
