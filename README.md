# MediTrack

SWEN 661 Group 1 project · Healthcare · Seniors (65+)

Team members: Amol Bhatia, Caleb Afunyah, and Eugene Masamuna. The project targets offline-first medication workflows and 200%+ text scaling.

A self-contained Flutter prototype for managing medicines, recording doses and symptoms, and preparing an appointment summary. Ten core screens follow the supplied MediTrack HTML design. All records stay on the current device.

**Prototype only: use sample data.** Local storage is unencrypted; notifications, cloud sync and external sharing are not connected. See [limitations](docs/LIMITATIONS.md).

## Start here

Install **Flutter 3.47.5** (includes Dart 3.13.4), Git, and Python 3.10 or newer. The exact Flutter version is recorded in `.flutter-version`; dependencies are pinned in `pubspec.lock`. Add Flutter's `bin` directory to your PATH. Chrome is the simplest way to try the app; no Android SDK or Xcode is needed for the web version.

After cloning this repository, open its root folder (the one containing `pubspec.yaml`):

```sh
flutter doctor
flutter pub get --enforce-lockfile
flutter run -d chrome
```

Start with **Add medicine**. Enter sample details, daily times such as `08:00, 18:00`, then review and save. Today supports Taken, Skip and Undo; History lets you correct saved records. More opens symptoms, summaries and larger-text settings. The text-size slider offers 100%, 125%, 150%, 175% and 200%; the quick toggle switches between 100% and 200%. Your choice is saved, and larger device accessibility settings still apply. The app starts empty so demonstration records cannot be mistaken for personal records. Every screen shows the current local time at the top right, using your device’s 12/24-hour preference.

To run on an Android emulator or iOS simulator, complete that platform's setup reported by `flutter doctor`, start the emulator/simulator, run `flutter devices`, then `flutter run -d DEVICE_ID`. iOS requires macOS and Xcode. Native builds have not been verified in this repository's current validation.

## Run from GitHub in the iPhone Simulator

Clone the repository to your Mac and run it locally. GitHub hosts the source code and automated checks; the interactive iPhone Simulator runs on your Mac.

You need macOS, Xcode with an installed iOS simulator runtime, and the Flutter version listed above. Run `flutter doctor` and address any iOS setup issues before continuing. See [Flutter's iOS setup guide](https://docs.flutter.dev/platform-integration/ios/setup).

In Terminal, run:

```sh
git clone https://github.com/AIndian/MediTrack.git
cd MediTrack

flutter pub get --enforce-lockfile
xcrun simctl boot "iPhone 18 Pro"
open -a DeviceHub
flutter run -d "iPhone 18 Pro"
```

This example uses an installed **iPhone 18 Pro** simulator. If your Mac has a different simulator, run `xcrun simctl list devices available` and substitute its name in the boot command. Then run `flutter devices` and use its name or device ID with `flutter run -d`. If the simulator is already booted, continue with the remaining commands.

Xcode 27 calls the simulator app **Device Hub**. On Xcode 26 or earlier, replace `open -a DeviceHub` with `open -a Simulator`. The first build may take several minutes.

While Flutter is running in Terminal:

- Press **r** to reload code changes.
- Press **R** to restart the app.
- Press **q** to stop.

### Get updates from GitHub

If you already cloned the repository, use the existing folder instead of cloning again. Stop the running app, save and commit any local changes, then run from the repository root:

```sh
git pull --ff-only
flutter pub get --enforce-lockfile
flutter run -d "iPhone 18 Pro"
```

Use your simulator's name or device ID if different. If the simulator has been shut down, boot it again before running Flutter.

GitHub also runs automated tests and provides downloadable coverage reports and web builds in the repository's [Actions tab](https://github.com/AIndian/MediTrack/actions).

## Run all checks

```sh
python3 tool/verify.py --web
```

On Windows use `python` instead of `python3`. The helper works from any directory, checks the Flutter version, restores locked dependencies, verifies Dart formatting, runs static analysis and tests, enforces **at least 60% application line coverage**, and builds the web release. Omit `--web` for faster checks while editing.

Run individual checks directly:

```sh
flutter test test/unit
flutter test test/widget
flutter test --coverage
python3 tool/coverage_report.py
flutter analyze
flutter build web --release
```

Open `reports/coverage.html` for a line-by-line report. `coverage/lcov.info` is available for coverage tools. Generated output is ignored by Git and is recreated by the verification command. [Testing details and verified results](docs/TESTING.md).

## Repository layout

```text
.github/workflows/ci.yml    GitHub pull-request and main-branch checks
lib/
  main.dart                App startup and persistence initialization
  app.dart                 Theme, text scaling and root application
  models/                  Medicine data model and serialization
  state/                   ChangeNotifier store and local persistence
  screens/                 Individual screens and navigation shell
  widgets/                 Shared design components and dose controls
test/
  unit/                    Store, persistence and date-filter tests
  widget/                  Startup, navigation, forms and accessibility tests
  support/                 Shared sample data and fixed-clock fixtures
tool/                      Cross-platform verification and report helpers
docs/
  design/reference/        Copied HTML, tokens and project references
  design/DESIGN_PARITY.md  Mapping from HTML to Flutter and deviations
  images/                  Checked-in sample phone preview
android/ ios/ web/         Platform launch projects
pubspec.yaml               App dependencies and SDK constraints
pubspec.lock               Exact dependency versions
```

Read the [architecture](docs/ARCHITECTURE.md), [design mapping](docs/design/DESIGN_PARITY.md), [contribution guide](CONTRIBUTING.md), and [GitHub publishing instructions](docs/GITHUB.md).

## GitHub automation

The workflow runs the same verification helper on pull requests, pushes to `main`, and manual dispatch. It downloads the pinned Flutter SDK from the official Flutter repository, requires read-only repository permissions, and uploads coverage reports and the compiled web app as artifacts. No custom secrets or paid coverage service are required. See [GitHub Actions](https://github.com/AIndian/MediTrack/actions/workflows/ci.yml) for the current run status. Local checks and a clean-copy check are documented separately.

## Reference preview

Open `docs/design/reference/index.html` in a browser to inspect the supplied interactive design. These files are copied reference material; the original synced files outside this repository were not changed. One source was unavailable in the original project mirror.

![Sample Flutter phone preview](docs/images/flutter-phone.png)

## License

Licensed under the [MIT License](LICENSE). Copyright (c) 2026 Amol Bhatia and UMGC. Third-party dependencies retain their respective licenses.
