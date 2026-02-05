🔗 ZİNCİR NASIL ÇALIŞIR? (ADIM ADIM)
1️⃣ Server sertifika gönderir

Server, TLS handshake sırasında şunu yollar:

Sertifika (certificate)

İçinde:

domain adı (example.com)

public key

imza
xStep20012006()%
Ama bu imza server’a ait değildir.

2️⃣ Sertifikayı KİM imzalamış?

Sertifikanın içinde şunu yazar:

“Bu sertifikayı X imzaladı”

X = Certificate Authority (CA)
(örnek: Let’s Encrypt, DigiCert, GlobalSign)