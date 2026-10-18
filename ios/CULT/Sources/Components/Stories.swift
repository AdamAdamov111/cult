import SwiftUI

// MARK: - Ряд кружков

struct StoriesRow: View {
    @Environment(AppState.self) private var state
    let onOpen: (Int) -> Void

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 10) {
                ForEach(Array(Catalog.stories.enumerated()), id: \.element.id) { i, story in
                    Button {
                        Haptics.tap()
                        onOpen(i)
                    } label: {
                        VStack(spacing: 6) {
                            BundleImage(path: story.cover)
                                .frame(width: 60, height: 60)
                                .clipShape(Circle())
                                .padding(2)
                                .background(
                                    Circle().fill(Palette.bg).padding(0.5)
                                )
                                .overlay(
                                    Circle().strokeBorder(ring(for: story), lineWidth: 2)
                                )
                                .frame(width: 66, height: 66)
                            Text(story.label)
                                .font(.system(size: 10, weight: .medium))
                                .foregroundStyle(Palette.ink2)
                                .lineLimit(1)
                        }
                        .frame(width: 70)
                    }
                    .buttonStyle(PressStyle())
                }
            }
            .padding(.horizontal, Metrics.pad)
        }
        .scrollClipDisabled()
    }

    private func ring(for story: Story) -> AngularGradient {
        state.isUnseen(story)
            ? AngularGradient(colors: [Palette.gold, Color(UIColor(hex: 0xE8D3A3)),
                                       Palette.goldInk, Palette.gold],
                              center: .center)
            : AngularGradient(colors: [Palette.line, Palette.line], center: .center)
    }
}

// MARK: - Полноэкранный просмотрщик

struct StoriesViewer: View {
    @Environment(AppState.self) private var state
    @Environment(\.dismiss) private var dismiss

    @State var storyIndex: Int
    @State private var slideIndex = 0
    @State private var progress: Double = 0
    @State private var paused = false
    @State private var drag: CGFloat = 0

    let onTarget: (Target) -> Void

    private let duration: Double = 5.2
    private var story: Story { Catalog.stories[storyIndex] }
    private var slide: StorySlide { story.slides[slideIndex] }

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            BundleImage(path: slide.image)
                .ignoresSafeArea()

            LinearGradient(colors: [.black.opacity(0.6), .clear],
                           startPoint: .top, endPoint: .center)
                .ignoresSafeArea()
            LinearGradient(colors: [.black.opacity(0.85), .clear],
                           startPoint: .bottom, endPoint: .center)
                .ignoresSafeArea()

            // зоны перелистывания
            HStack(spacing: 0) {
                Rectangle().fill(.clear).contentShape(Rectangle())
                    .onTapGesture { previous() }
                Rectangle().fill(.clear).contentShape(Rectangle())
                    .onTapGesture { next() }
            }

            VStack(spacing: 0) {
                header
                Spacer()
                body(for: slide)
            }
        }
        .offset(y: drag)
        .scaleEffect(1 - min(drag, 260) / 2400)
        .gesture(
            DragGesture()
                .onChanged { v in
                    paused = true
                    drag = max(0, v.translation.height)
                }
                .onEnded { _ in
                    if drag > 90 { Haptics.tap(); dismiss() }
                    else { withAnimation(.spring(duration: 0.3)) { drag = 0 }; paused = false }
                }
        )
        .task(id: "\(storyIndex)-\(slideIndex)") {
            state.markViewed(story: story.id, slide: slideIndex)
            progress = 0
            let step = 0.02
            while progress < 1, !Task.isCancelled {
                try? await Task.sleep(for: .seconds(step))
                if !paused { progress += step / duration }
            }
            if !Task.isCancelled { next() }
        }
        .statusBarHidden()
    }

    private var header: some View {
        VStack(spacing: 13) {
            HStack(spacing: 3) {
                ForEach(story.slides.indices, id: \.self) { i in
                    GeometryReader { geo in
                        Capsule().fill(.white.opacity(0.3))
                            .overlay(alignment: .leading) {
                                Capsule().fill(.white)
                                    .frame(width: geo.size.width * fill(for: i))
                            }
                    }
                    .frame(height: 2.5)
                }
            }

            HStack(spacing: 9) {
                Text("CU")
                    .font(Typo.bold(9)).tracking(1)
                    .foregroundStyle(Palette.gold)
                    .frame(width: 30, height: 30)
                    .background(Color(UIColor(hex: 0x1A1A1A)), in: Circle())
                Text("CULT · \(story.label)")
                    .font(Typo.semi(12.5)).foregroundStyle(.white)
                Text("\(slideIndex + 1)/\(story.slides.count)")
                    .font(.system(size: 11)).foregroundStyle(.white.opacity(0.6))
                Spacer()
                Button { dismiss() } label: {
                    Image(systemName: "xmark")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundStyle(.white)
                        .frame(width: 34, height: 34)
                        .contentShape(Rectangle())
                }
            }
        }
        .padding(.horizontal, 12)
        .padding(.top, 10)
    }

    private func body(for slide: StorySlide) -> some View {
        VStack(alignment: .leading, spacing: 7) {
            Eyebrow(text: slide.eyebrow, color: Palette.gold)
            Text(slide.title)
                .font(Typo.semi(25)).tracking(-0.6)
                .foregroundStyle(.white)
                .fixedSize(horizontal: false, vertical: true)
            Text(slide.text)
                .font(.system(size: 13.5))
                .foregroundStyle(.white.opacity(0.9))
                .fixedSize(horizontal: false, vertical: true)

            Button {
                Haptics.press()
                let target = slide.target
                dismiss()
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.35) { onTarget(target) }
            } label: {
                HStack(spacing: 7) {
                    Text(slide.cta).font(Typo.bold(14))
                    Image(systemName: "chevron.right").font(.system(size: 13, weight: .bold))
                }
                .foregroundStyle(.black)
                .frame(maxWidth: .infinity, minHeight: 46)
                .background(.white, in: RoundedRectangle(cornerRadius: Metrics.radiusSm, style: .continuous))
            }
            .buttonStyle(PressStyle())
            .padding(.top, 11)
        }
        .padding(.horizontal, 20)
        .padding(.bottom, 24)
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private func fill(for index: Int) -> Double {
        if index < slideIndex { return 1 }
        if index > slideIndex { return 0 }
        return min(1, progress)
    }

    private func next() {
        Haptics.tap()
        if slideIndex + 1 < story.slides.count {
            slideIndex += 1
        } else if storyIndex + 1 < Catalog.stories.count {
            storyIndex += 1
            slideIndex = 0
        } else {
            dismiss()
        }
    }

    private func previous() {
        Haptics.tap()
        if slideIndex > 0 {
            slideIndex -= 1
        } else if storyIndex > 0 {
            storyIndex -= 1
            slideIndex = 0
        }
    }
}
