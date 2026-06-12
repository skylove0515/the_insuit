; 보험도감 설치 프로그램 빌드 스크립트
; 사용법: Inno Setup(https://jrsoftware.org/isdl.php) 설치 후
;        본 파일을 Inno Setup으로 열고 Build > Compile (또는 build_installer.bat 더블클릭)

#define MyAppName "보험도감"
#define MyAppVersion "1.0"
#define MyAppPublisher "보험도감"

[Setup]
AppId={{B6F2A1C4-9E3D-4A6B-8C2E-7F1D5A9C3E10}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={autopf}\InsuranceGuide
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes
OutputDir=Output
OutputBaseFilename=보험도감_Setup
SetupIconFile=icon.ico
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
ArchitecturesInstallIn64BitMode=x64compatible

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "바탕화면에 바로가기 아이콘 만들기"; GroupDescription: "추가 아이콘:"

[Files]
Source: "renderer\*"; DestDir: "{app}\renderer"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "launcher.vbs"; DestDir: "{app}"; Flags: ignoreversion
Source: "icon.ico"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{sys}\wscript.exe"; Parameters: """{app}\launcher.vbs"""; WorkingDir: "{app}"; IconFilename: "{app}\icon.ico"
Name: "{group}\{#MyAppName} 제거"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{sys}\wscript.exe"; Parameters: """{app}\launcher.vbs"""; WorkingDir: "{app}"; IconFilename: "{app}\icon.ico"; Tasks: desktopicon

[Run]
Filename: "{sys}\wscript.exe"; Parameters: """{app}\launcher.vbs"""; WorkingDir: "{app}"; Description: "{#MyAppName} 실행"; Flags: nowait postinstall skipifsilent
