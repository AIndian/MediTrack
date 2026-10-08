# Working with the GitHub repository

Repository: https://github.com/AIndian/MediTrack

Clone and verify:

```sh
git clone https://github.com/AIndian/MediTrack.git
cd MediTrack
python3 tool/verify.py --web
```

Install the Flutter version in `.flutter-version` and Python first; see the root README. On Windows, use `python` instead of `python3`.

To contribute, create a branch, commit your changes, and push it using your usual GitHub authentication. Open a pull request against `main`. Do not place credentials or tokens in repository files.

**Flutter checks** runs on pull requests and pushes to `main`. Confirm the job passes in GitHub's Actions tab. Download the `coverage` artifact for the HTML report or the `meditrack-web` artifact to serve the compiled app. Extract the web artifact and run `python3 -m http.server 8080` inside it, then open `http://localhost:8080`.

Repository owners may protect `main` and require the `verify` job before merging. Branch protection is not configured by the local project setup.

The workflow uses the documented [checkout](https://github.com/actions/checkout), [setup-python](https://github.com/actions/setup-python), and [upload-artifact](https://github.com/actions/upload-artifact) actions. Flutter is installed directly from its official Git repository at the tag in `.flutter-version`.

Original GitHub commit history and project attribution are preserved. The project uses the MIT License with copyright attributed to Amol Bhatia and UMGC; third-party dependency licenses remain unchanged.
