Option Explicit

Dim objShell, objFSO, strProjectFolder, strInstallScript

' Initialize objects
Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Define the path of the project folder and the install script
strProjectFolder = objFSO.GetSpecialFolder(2) & "\nodejs-telegram-bot-master"
strInstallScript = "install_bot.vbs" ' Ensure this path is correct relative to this script

' Check if the project folder exists
If objFSO.FolderExists(strProjectFolder) Then
    On Error Resume Next
    ' Delete the project folder
    objFSO.DeleteFolder strProjectFolder, True
    If Err.Number <> 0 Then
        WScript.Echo "Error deleting folder: " & Err.Description
        Err.Clear
    End If
    On Error GoTo 0
End If

' Call the install script
objShell.Run "cscript " & Chr(34) & objFSO.GetAbsolutePathName(strInstallScript) & Chr(34), 1, True

' Clean up
Set objFSO = Nothing
Set objShell = Nothing
