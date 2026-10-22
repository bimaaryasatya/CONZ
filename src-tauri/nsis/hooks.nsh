; NSIS hooks for CONZ Windows Installer
; Automatically register startup shortcut on install and cleanup on uninstall

!macro NSIS_HOOK_POSTINSTALL
  DetailPrint "Menambahkan CONZ ke Startup Windows..."
  CreateShortcut "$SMSTARTUP\CONZ.lnk" "$INSTDIR\conz.exe" "" "$INSTDIR\conz.exe" 0
!macroend

!macro NSIS_HOOK_POSTUNINSTALL
  DetailPrint "Menghapus CONZ dari Startup Windows..."
  Delete "$SMSTARTUP\CONZ.lnk"
!macroend
