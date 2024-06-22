' Create required objects
Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")
Set objWinHTTP = CreateObject("WinHttp.WinHttpRequest.5.1")
Set objStream = CreateObject("ADODB.Stream")

' Function to download a file
Function DownloadFile(url, path)
    objWinHTTP.Open "GET", url, False
    objWinHTTP.Send
    If objWinHTTP.Status = 200 Then
        objStream.Open
        objStream.Type = 1 ' adTypeBinary
        objStream.Write objWinHTTP.ResponseBody
        objStream.Position = 0 ' Set the stream position to the start
        objStream.SaveToFile path, 2 ' adSaveCreateOverWrite
        objStream.Close
    End If
End Function

' Get the directory of the current script
scriptPath = objFSO.GetParentFolderName(WScript.ScriptFullName)

' Show confirmation message box
response = MsgBox("Vuoi aggiornare il bot?", vbYesNo + vbQuestion, "Aggiornamento Bot")

If response = vbYes Then
    ' Delete the src folder
    If objFSO.FolderExists(scriptPath & "\src") Then
        objFSO.DeleteFolder scriptPath & "\src", True
    End If

    ' Download the zip file from GitHub
    downloadURL = "https://github.com/ValerioCietto/nodejs-telegram-bot/archive/refs/heads/master.zip"
    zipPath = scriptPath & "\master.zip"
    DownloadFile downloadURL, zipPath

    ' Create a temporary folder
    tempFolderPath = scriptPath & "\Temporary"
    If Not objFSO.FolderExists(tempFolderPath) Then
        objFSO.CreateFolder(tempFolderPath)
    End If

    ' Unzip the downloaded file
    Set objShellApp = CreateObject("Shell.Application")
    Set objZip = objShellApp.Namespace(zipPath)
    Set objDest = objShellApp.Namespace(tempFolderPath)
    objDest.CopyHere objZip.Items, 16

    ' Wait for the extraction to complete
    WScript.Sleep 5000

    ' Copy the src folder from the unzipped contents to the current directory
    objFSO.MoveFolder tempFolderPath & "\nodejs-telegram-bot-master\src", scriptPath & "\src"

    ' Delete the temporary folder and the zip file
    objFSO.DeleteFolder tempFolderPath, True
    objFSO.DeleteFile zipPath, True

    ' Show update complete message box
    MsgBox "Aggiornamento completato", vbInformation, "Aggiornamento"
End If

' Clean up
Set objShell = Nothing
Set objFSO = Nothing
Set objWinHTTP = Nothing
Set objStream = Nothing
Set objShellApp = Nothing