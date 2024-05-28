Option Explicit

Dim objShell, objFSO, objWinHttp, strUrl, strTempZip, strUnzipFolder, strDesktopPath, strShortcutPath

' Initialize objects
Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")
Set objWinHttp = CreateObject("WinHttp.WinHttpRequest.5.1")

' URL of the zip file
strUrl = "https://github.com/ValerioCietto/nodejs-telegram-bot/archive/refs/heads/master.zip"

' Path for temporary zip file and unzip folder
strTempZip = objFSO.GetSpecialFolder(2) & "\master.zip"
strUnzipFolder = objFSO.GetSpecialFolder(2) & "\nodejs-telegram-bot-master"

' Download the zip file
objWinHttp.Open "GET", strUrl, False
objWinHttp.Send
If objWinHttp.Status = 200 Then
    Dim objStream
    Set objStream = CreateObject("ADODB.Stream")
    objStream.Type = 1 ' Binary
    objStream.Open
    objStream.Write objWinHttp.ResponseBody
    objStream.SaveToFile strTempZip, 2 ' Overwrite if exists
    objStream.Close
    Set objStream = Nothing
Else
    WScript.Echo "Failed to download file: " & objWinHttp.Status & " - " & objWinHttp.StatusText
    WScript.Quit
End If

' Extract the zip file
Dim objApp, objNamespace, objDestination
Set objApp = CreateObject("Shell.Application")
Set objNamespace = objApp.Namespace(strTempZip)
Set objDestination = objApp.Namespace(strUnzipFolder)

If Not objFSO.FolderExists(strUnzipFolder) Then
    objFSO.CreateFolder strUnzipFolder
End If

objDestination.CopyHere(objNamespace.Items)

' Wait until extraction is complete
Do While objNamespace.Items.Count <> objDestination.Items.Count
    WScript.Sleep 100
Loop

' Open terminal and run npm install
Dim strCommand
strCommand = "cmd.exe /K cd /d """ & strUnzipFolder & "\nodejs-telegram-bot-master"" && npm install"
objShell.Run strCommand, 1, True

' Create a shortcut on the desktop
strDesktopPath = objShell.SpecialFolders("Desktop")
strShortcutPath = strDesktopPath & "\Start Node.js Telegram Bot.lnk"

Dim objShortcut
Set objShortcut = objShell.CreateShortcut(strShortcutPath)
objShortcut.TargetPath = "cmd.exe"
objShortcut.Arguments = "/K cd /d """ & strUnzipFolder & "\nodejs-telegram-bot-master"" && node src/app.js"
objShortcut.WorkingDirectory = strUnzipFolder & "\nodejs-telegram-bot-master"
objShortcut.WindowStyle = 1
objShortcut.IconLocation = objShell.ExpandEnvironmentStrings("%SystemRoot%\System32\SHELL32.dll,14")
objShortcut.Save

' Clean up
Set objWinHttp = Nothing
Set objFSO = Nothing
Set objShell = Nothing

WScript.Echo "Installation complete! Shortcut created on the desktop."
