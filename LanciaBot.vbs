Dim objShell, objFSO, scriptPath

Set objShell = WScript.CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Get the directory of the current script
scriptPath = objFSO.GetParentFolderName(WScript.ScriptFullName)

' Set the current directory to the script's directory
objShell.CurrentDirectory = scriptPath

' Show message box for 2 seconds
objShell.Popup "il bot è in avvio", 2, "Avvio Bot", vbInformation

' Run the Node.js application with CMD window visible
objShell.Run "cmd.exe /k node src/app.js", 1, False

Set objShell = Nothing
Set objFSO = Nothing