# CULT для iOS

Нативное приложение закрытого клуба BYRAIN. SwiftUI, без сторонних зависимостей.

| | |
|---|---|
| Язык и каркас | Swift 5, SwiftUI, iOS 17+ |
| Архитектура | `@Observable` состояние, `NavigationStack` на каждую вкладку |
| Подписка | StoreKit 2, автопродление, восстановление покупок |
| Данные | 108 товаров, 34 предложения, 5 разделов — всё в бандле, работает офлайн |
| Ресурсы | 206 изображений, Montserrat в пяти начертаниях |
| Вес сборки | 21 МБ |

## Запуск

```bash
cd ios
xcodegen generate     # собрать .xcodeproj из project.yml
open CULT.xcodeproj   # дальше ⌘R
```

Из командной строки:

```bash
xcodebuild -project CULT.xcodeproj -scheme CULT -sdk iphonesimulator \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro' \
  -derivedDataPath build CODE_SIGNING_ALLOWED=NO build
xcrun simctl install booted build/Build/Products/Debug-iphonesimulator/CULT.app
xcrun simctl launch booted ru.byrain.cult
```

Проект не хранится в репозитории: `project.yml` — источник правды,
`.xcodeproj` генерируется. Так не бывает конфликтов слияния.

## Что внутри

```
Sources/
  App/        точка входа, вкладки и навигация, тема, тактильный отклик
  Models/     модели контента, загрузчик каталога, кэш изображений
  Store/      состояние пользователя, StoreKit, платёжный слой
  Components/ карточки, карусель, сторис, QR, элементы оформления
  Screens/    главная, каталог, раздел, бренд, товар, предложение,
              корзина, членство, профиль, заказы, купоны
Resources/
  content.json   весь контент, выгружается из веб-версии одной командой
  Images/        фотографии разделов, партнёров и товаров
  Fonts/         Montserrat
  Configuration.storekit   локальная подписка для тестов без App Store Connect
```

## Обновление контента

Контент общий с веб-версией — правится в `src/data/*.ts` и выгружается:

```bash
cd ..
./node_modules/.bin/esbuild scripts/export-ios.ts --bundle --platform=node \
  --format=cjs --outfile=/tmp/export-ios.cjs && node /tmp/export-ios.cjs
```

## Деньги: почему два разных контура

Apple требует разделять цифровое и физическое.

**Членство 3 000 ₽/мес** — цифровая услуга внутри приложения, поэтому только
через StoreKit (внутренняя покупка). Apple удерживает комиссию: 15% в Small
Business Program при обороте до 1 млн $ в год, иначе 30%. Товар заведён как
auto-renewable subscription `ru.byrain.cult.membership.monthly`.

**Косметика** — физический товар. Apple прямо **запрещает** проводить его через
внутренние покупки (Guideline 3.1.5a). Оплата идёт мимо StoreKit: Apple Pay или
карта через платёжного провайдера, деньги на расчётный счёт напрямую, без
комиссии Apple. Слой — `Store/Payments.swift`, пока в демо-режиме.

Для симулятора подписка работает через `Configuration.storekit`: при запуске из
Xcode открывается настоящее окно покупки без App Store Connect. При запуске мимо
Xcode StoreKit недоступен, и членство выдаётся локально — на экране это помечено.

## Как показать приложение людям

**На своём iPhone, бесплатно.** Подключить телефон кабелем, в Xcode выбрать его
как цель, в Signing & Capabilities указать свой Apple ID как команду. Сборка
живёт 7 дней, потом пересобрать. Для себя и для демонстрации в руках — хватает.

**Партнёрам — TestFlight.** Нужен Apple Developer Program, 99 $ в год.
Порядок: оплатить программу → в App Store Connect создать приложение с bundle id
`ru.byrain.cult` → в Xcode Product → Archive → Distribute App → App Store Connect
→ в TestFlight добавить внешних тестировщиков. Они получают ссылку-приглашение и
ставят приложение через TestFlight. До 10 000 тестировщиков, сборка живёт 90 дней.
Первая внешняя сборка проходит короткую проверку Apple, обычно за сутки.

**В App Store.** После TestFlight: заполнить карточку, скриншоты, политику
конфиденциальности, возрастной рейтинг, подать на ревью. Отдельно: подписка
требует описания, скриншота и указания цены в App Store Connect.

## Что нужно сделать до публикации

- Политика конфиденциальности по публичной ссылке — обязательна для ревью
- Экран согласия на обработку персональных данных (152-ФЗ)
- Перенос заказов и профиля на сервер в РФ вместо хранения на устройстве
- Боевой платёжный провайдер вместо демо-режима в `Payments.swift`
- Подписка в App Store Connect с реальной ценой и локализацией
