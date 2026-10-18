import SwiftUI

@main
struct CultApp: App {
    @State private var state = AppState()
    @State private var router = Router()
    @State private var membership = MembershipStore()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(state)
                .environment(router)
                .environment(membership)
                .tint(Palette.ink)
                .task {
                    await membership.load()
                    // StoreKit — источник правды о членстве: подтягиваем при старте
                    if let entitlement = await membership.currentEntitlement() {
                        state.setMembership(expiry: entitlement.expiry, autoRenew: entitlement.autoRenew)
                    }
                }
        }
    }
}
