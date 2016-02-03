# pi-rfid-reader

I wanted to explore RFID technology and decided to write a library to interact with a bare-bones reader in order to gain full control.

The Cottonwood reader was connected to a Raspberry Pi over serial ports, allowing the program to use Sockets to generate live updates for a server.

The reader maintains live status updates to show it's state while continuously checking for new tags to report to the backend.
