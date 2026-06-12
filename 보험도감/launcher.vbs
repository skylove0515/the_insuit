Set fso = CreateObject("Scripting.FileSystemObject")
basePath = fso.GetParentFolderName(WScript.ScriptFullName)
appPath = basePath & "\renderer\index.html"

edge1 = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
edge2 = "C:\Program Files\Microsoft\Edge\Application\msedge.exe"

Set shell = CreateObject("WScript.Shell")

If fso.FileExists(edge1) Then
    shell.Run """" & edge1 & """ --app=""file:///" & appPath & """ --window-size=1400,940", 1, False
ElseIf fso.FileExists(edge2) Then
    shell.Run """" & edge2 & """ --app=""file:///" & appPath & """ --window-size=1400,940", 1, False
Else
    shell.Run """" & appPath & """", 1, False
End If
