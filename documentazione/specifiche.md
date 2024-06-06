Pubblica Assistenza Monterenzio.
l'invio dei messaggi su telegram

Ti allego uno SCREENSHOT DEL DUMP (la pagina che mostra le emergenze in tempo reale nella provincia di Bologna. Da lì puoi vedere come è rappresentato. Ogni riga corrisponde a una emergenza.
A destra alcune hanno la sigla dell'ambulanza assegnata,
altre no perché sono lasciate in attesa (per vari motivi che magari ti spiegherò più avanti se sei curioso).
Sottolineato in blu vedi i dati che il bot dovrà estrapolare quando sarà assegnata a quella riga il nome delle nostre ambulanze. (il bot deve estrapolare CODICE, PROVINCIA, LOCALITà - COMUNE, INDIRIZZO, EVENTO, MEZZO COORDS)
Se in indirizzo c'è il segno > significa incrocio tra le due vie.
Ci può essere più di un mezzo assegnato alle emergenze

Esempio di messaggi
MONTERENZIO41 IMOLA132 - si è liberato alle 10:51

EMERGENZA N° 021717 -> KC03R - Mezzo MONTERENZIO41 si è liberato alle 11:30

Attenzione!
🚑ALERT! EMERGENZA N° 021815 alle 12:29 IN CORSO
SC01V località OZZANO DELL'EMILIA CAPOLUOGO - OZZANO DELL'EMILIA PARCO DELLA RESISTENZA PARCO DELLA RESISTENZA
Il mezzo assegnato all'intervento è la macchina MONTERENZIO41 in STRADA con patologia TRAUMATICA codice VERDE
link a openstreetmap

Attenzione!
🚑ALERT! EMERGENZA N° 021815 ha cambiato codice colore gravità da VERDE a GIALLO alle ore 12:38

Le sigle delle nostre ambulanze che fanno emergenza (e quindi che il bot dovrà ricercare sono: MONTERENZIO41 e MONTERENZIO42.

I messaggi che il bot (chiamato Mr Dump) dovrebbe inviare in automatico sono:

MESSAGGIO DI EMERGENZA IN ATTO con i relativi dati

MESSAGGIO DI FINE EMERGENZA: quando non ritrova più la stessa emergenza sul dump, è scomparsa, vuol dire che è terminata e lo notifica

NOTIFICA CAMBIO CODICE alle volte in itinere l'emergenza cambia codice (in genere di gravità) che è la lettera finale del codice emergenza. Esempio un K1G vuol dire Kilo (in casa) 1 (patologia traumatica) G (giallo). Comunque ti allego la legenda. Dovrebbe esserci il messaggio che notifica il cambio di codice relativo a quella emergenza

NOTIFICA CAMBIO NUMERO MEZZI Se si aggiunge un mezzo che prima non era assegnato dovrebbe essere notificato

EMERGENZA IN SOSTA Se c'è per più di 5 minuti una emergenza in sosta (quindi ancora senza una ambulanza assegnata) ed è nel comune Monterenzio, dovrebbe mandare un messaggio (Desiderata, permette all'equipaggio di prepararsi ma non è indispensabile)

---

ciclo di vita di una emergenza

c'è un emergencyId? è una emergenza

id 1, no emergency with id 1
-> messageNewEmergency

id 1, emergency with id 1 exists, old emergency has vehicles null, new has at least one vehicle
-> messageNewEmergency

id 1, emergency with id 1 exists, old emergency has vehicles != new emergency.vehicles
-> messageChangeNumberOfVehicles

id 1, codex SC01V, comune MONTERENZIO, mezzi null, time now - time start > 5 min
-> messageEmergencyInStandBy

id 1, codex SC01G, old codex SC01V,
-> messageChangeCode

se emergenze > 1
ricontrolla tutte le emergenze
se emergenza non c'è in nuove emergenze, chiama evento
-> messageEndEmergency
