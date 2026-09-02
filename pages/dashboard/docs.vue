<template>
  <div>
    <div class="card">
      <h2 class="page-title">Panduan Integrasi API WARUNGERIKPAY</h2>
      <p class="page-sub">Dokumentasi resmi REST API untuk menerbitkan invoice Dynamic QRIS, mengecek status transaksi, serta memverifikasi Webhook Callback dari aplikasi web (PHP, Laravel, Node.js, Python) maupun mobile (Flutter, Android).</p>

      <div class="toc">
        <h4 class="toc-title">Daftar Isi Dokumentasi</h4>
        <ul class="toc-list">
          <li><a href="#auth" class="toc-link">1. Autentikasi & Secret Key Header</a></li>
          <li><a href="#create" class="toc-link">2. Menerbitkan Invoice QRIS (POST /api/v1/checkout)</a></li>
          <li><a href="#response" class="toc-link">3. Struktur Response API (Multi-Line JSON)</a></li>
          <li><a href="#check-status" class="toc-link">4. Cek Status Transaksi (GET /api/v1/order/:orderId)</a></li>
          <li><a href="#webhook" class="toc-link">5. Webhook Callback Notification</a></li>
          <li><a href="#verify" class="toc-link">6. Verifikasi Signature Webhook (HMAC SHA-256)</a></li>
          <li><a href="#status" class="toc-link">7. Daftar Status Transaksi</a></li>
          <li><a href="#errors" class="toc-link">8. Kode Error HTTP & Troubleshooting</a></li>
        </ul>
      </div>

      <hr class="divider" />

      <div id="auth" class="section">
        <h3 class="sh">1. Autentikasi & Secret Key Header</h3>
        <p class="sp">Setiap request API wajib menyertakan <strong>Secret Key</strong> pada HTTP Header. Secret Key dapat Anda kelola di halaman <strong>Dashboard → API Key</strong>.</p>

        <div class="code-box">
          <div class="code-box-header">
            <span class="code-box-title">HTTP Header Authorization</span>
            <span class="code-box-badge">REQUIRED</span>
          </div>
          <pre class="code-pre"><code><span class="c-key">x-secret-key</span>: <span class="c-str">sk_live_XXXXXXXXXXXXXXXX</span>
<span class="c-key">Content-Type</span>: <span class="c-str">application/json</span></code></pre>
        </div>

        <div class="warn-box">
          <div>
            <strong>Keamanan Kunci Rahasia (Secret Key)</strong>
            <p>Jangan pernah mempublikasikan Secret Key Anda di repository publik atau aplikasi frontend JavaScript browser. Selalu gunakan Secret Key di server backend milik Anda.</p>
          </div>
        </div>
      </div>

      <hr class="divider" />

      <div id="create" class="section">
        <h3 class="sh">2. Menerbitkan Invoice QRIS (Create Checkout)</h3>
        <div class="endpoint">
          <span class="method">POST</span>
          <span class="url">https://pg.warungerik.com/api/v1/checkout</span>
        </div>

        <h4 class="sub-h">Request Header & Body Parameters</h4>
        <div class="tw">
          <table>
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Tipe</th>
                <th>Wajib</th>
                <th>Keterangan & Deskripsi Opsional</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="mono bold">amount</td>
                <td>Number</td>
                <td><span class="req">Wajib</span></td>
                <td>Nominal transaksi dalam Rupiah (Minimal Rp 1.000, contoh: <code class="hl">50000</code>).</td>
              </tr>
              <tr>
                <td class="mono bold">customerName</td>
                <td>String</td>
                <td><span class="req">Wajib</span></td>
                <td>Nama pembeli / pelanggan (contoh: <code class="hl">"Budi Santoso"</code>).</td>
              </tr>
              <tr>
                <td class="mono bold">note</td>
                <td>String</td>
                <td><span class="opt">Opsional</span></td>
                <td>Catatan atau rincian pesanan (contoh: <code class="hl">"Pembelian Produk Premium #102"</code>).</td>
              </tr>
              <tr>
                <td class="mono bold">orderId</td>
                <td>String</td>
                <td><span class="opt">Opsional</span></td>
                <td>ID unik pesanan dari toko kamu. Jika dikosongkan, sistem akan otomatis menghasilkan <code class="hl">ORD-TIMESTAMP-XX</code>.</td>
              </tr>
              <tr>
                <td class="mono bold">fee_bearer</td>
                <td>String</td>
                <td><span class="opt">Opsional</span></td>
                <td><code class="hl">CUSTOMER</code> (fee 0.5% ditambahkan ke tagihan pelanggan) atau <code class="hl">MERCHANT</code> (fee 0.5% dipotong dari saldo).</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 class="sub-h">Contoh Kode Request Integrasi Backend</h4>
        <div class="lang-tabs">
          <button class="lt" :class="{active: lang==='php'}" @click="lang='php'">PHP (cURL)</button>
          <button class="lt" :class="{active: lang==='laravel'}" @click="lang='laravel'">Laravel</button>
          <button class="lt" :class="{active: lang==='node'}" @click="lang='node'">Node.js</button>
          <button class="lt" :class="{active: lang==='python'}" @click="lang='python'">Python</button>
          <button class="lt" :class="{active: lang==='flutter'}" @click="lang='flutter'">Flutter / Dart</button>
        </div>

        <div class="code-box" v-if="lang==='php'">
          <div class="code-box-header">
            <span class="code-box-title">PHP Native (cURL)</span>
            <span class="code-box-lang">php</span>
          </div>
          <pre class="code-pre"><code><span class="c-kw">&lt;?php</span>
<span class="c-var">$secretKey</span> = <span class="c-str">"sk_live_XXXXXXXXXXXXXXXX"</span>;
<span class="c-var">$apiUrl</span>    = <span class="c-str">"https://pg.warungerik.com/api/v1/checkout"</span>;

<span class="c-var">$payload</span> = json_encode([
    <span class="c-key">"amount"</span>       => <span class="c-num">50000</span>,
    <span class="c-key">"customerName"</span> => <span class="c-str">"Budi Santoso"</span>,
    <span class="c-key">"note"</span>         => <span class="c-str">"Pembelian Produk Digital Premium"</span>,
    <span class="c-key">"orderId"</span>      => <span class="c-str">"INV-"</span> . time(),
    <span class="c-key">"fee_bearer"</span>   => <span class="c-str">"CUSTOMER"</span>
], JSON_PRETTY_PRINT);

<span class="c-var">$ch</span> = curl_init(<span class="c-var">$apiUrl</span>);
curl_setopt_array(<span class="c-var">$ch</span>, [
    CURLOPT_HTTPHEADER     => [
        <span class="c-str">"Content-Type: application/json"</span>,
        <span class="c-str">"x-secret-key: "</span> . <span class="c-var">$secretKey</span>
    ],
    CURLOPT_POST           => <span class="c-bool">true</span>,
    CURLOPT_POSTFIELDS     => <span class="c-var">$payload</span>,
    CURLOPT_RETURNTRANSFER => <span class="c-bool">true</span>,
    CURLOPT_TIMEOUT        => <span class="c-num">30</span>
]);

<span class="c-var">$response</span> = curl_exec(<span class="c-var">$ch</span>);
<span class="c-var">$httpCode</span> = curl_getinfo(<span class="c-var">$ch</span>, CURLINFO_HTTP_CODE);
curl_close(<span class="c-var">$ch</span>);

<span class="c-var">$result</span> = json_decode(<span class="c-var">$response</span>, <span class="c-bool">true</span>);

<span class="c-kw">if</span> (<span class="c-var">$result</span>[<span class="c-str">'success'</span>] === <span class="c-bool">true</span>) {
    <span class="c-cm">// Redirect pelanggan langsung ke halaman checkout QRIS</span>
    header(<span class="c-str">"Location: "</span> . <span class="c-var">$result</span>[<span class="c-str">'data'</span>][<span class="c-str">'paymentUrl'</span>]);
    <span class="c-kw">exit</span>;
} <span class="c-kw">else</span> {
    echo <span class="c-str">"Error: "</span> . <span class="c-var">$result</span>[<span class="c-str">'message'</span>];
}</code></pre>
        </div>

        <div class="code-box" v-if="lang==='laravel'">
          <div class="code-box-header">
            <span class="code-box-title">Laravel Controller</span>
            <span class="code-box-lang">php</span>
          </div>
          <pre class="code-pre"><code><span class="c-kw">namespace</span> App\Http\Controllers;

<span class="c-kw">use</span> Illuminate\Http\Request;
<span class="c-kw">use</span> Illuminate\Support\Facades\Http;

<span class="c-kw">class</span> <span class="c-title">PaymentController</span> <span class="c-kw">extends</span> Controller
{
    <span class="c-kw">public function</span> <span class="c-title">createCheckout</span>(Request <span class="c-var">$request</span>)
    {
        <span class="c-var">$response</span> = Http::withHeaders([
            <span class="c-str">'x-secret-key'</span> => env(<span class="c-str">'WARUNGERIKPAY_SECRET_KEY'</span>),
            <span class="c-str">'Content-Type'</span>   => <span class="c-str">'application/json'</span>
        ])->post(<span class="c-str">'https://pg.warungerik.com/api/v1/checkout'</span>, [
            <span class="c-str">'amount'</span>       => <span class="c-var">$request</span>->total_price,
            <span class="c-str">'customerName'</span> => <span class="c-var">$request</span>->customer_name,
            <span class="c-str">'note'</span>         => <span class="c-str">'Order #'</span> . <span class="c-var">$request</span>->order_id,
            <span class="c-str">'orderId'</span>      => <span class="c-str">'INV-'</span> . <span class="c-var">$request</span>->order_id,
            <span class="c-str">'fee_bearer'</span>   => <span class="c-str">'CUSTOMER'</span>
        ]);

        <span class="c-kw">if</span> (<span class="c-var">$response</span>->successful()) {
            <span class="c-var">$paymentUrl</span> = <span class="c-var">$response</span>->json(<span class="c-str">'data.paymentUrl'</span>);
            <span class="c-kw">return</span> redirect(<span class="c-var">$paymentUrl</span>);
        }

        <span class="c-kw">return</span> back()->withErrors([
            <span class="c-str">'payment'</span> => <span class="c-var">$response</span>->json(<span class="c-str">'message'</span>)
        ]);
    }
}</code></pre>
        </div>

        <div class="code-box" v-if="lang==='node'">
          <div class="code-box-header">
            <span class="code-box-title">Node.js / Express</span>
            <span class="code-box-lang">javascript</span>
          </div>
          <pre class="code-pre"><code><span class="c-kw">const</span> express = require(<span class="c-str">'express'</span>);
<span class="c-kw">const</span> app = express();

<span class="c-kw">const</span> SECRET_KEY = process.env.WARUNGERIKPAY_SECRET_KEY;

app.post(<span class="c-str">'/create-payment'</span>, <span class="c-kw">async</span> (req, res) => {
  <span class="c-kw">try</span> {
    <span class="c-kw">const</span> response = <span class="c-kw">await</span> fetch(
      <span class="c-str">'https://pg.warungerik.com/api/v1/checkout'</span>,
      {
        method: <span class="c-str">'POST'</span>,
        headers: {
          <span class="c-str">'Content-Type'</span>: <span class="c-str">'application/json'</span>,
          <span class="c-str">'x-secret-key'</span>: SECRET_KEY
        },
        body: JSON.stringify({
          amount: req.body.amount,
          customerName: req.body.name,
          note: <span class="c-str">`Pembelian via Node.js`</span>,
          orderId: <span class="c-str">`INV-${Date.now()}`</span>,
          fee_bearer: <span class="c-str">'CUSTOMER'</span>
        })
      }
    );

    <span class="c-kw">const</span> json = <span class="c-kw">await</span> response.json();

    <span class="c-kw">if</span> (json.success) {
      res.json({ paymentUrl: json.data.paymentUrl });
    } <span class="c-kw">else</span> {
      res.status(<span class="c-num">400</span>).json({ error: json.message });
    }
  } <span class="c-kw">catch</span> (err) {
    res.status(<span class="c-num">500</span>).json({ error: <span class="c-str">'Server Error'</span> });
  }
});</code></pre>
        </div>

        <div class="code-box" v-if="lang==='python'">
          <div class="code-box-header">
            <span class="code-box-title">Python Requests</span>
            <span class="code-box-lang">python</span>
          </div>
          <pre class="code-pre"><code><span class="c-kw">import</span> requests
<span class="c-kw">import</span> time

SECRET_KEY = <span class="c-str">"sk_live_XXXXXXXXXXXXXXXX"</span>
API_URL = <span class="c-str">"https://pg.warungerik.com/api/v1/checkout"</span>

payload = {
    <span class="c-key">"amount"</span>: <span class="c-num">50000</span>,
    <span class="c-key">"customerName"</span>: <span class="c-str">"Budi Santoso"</span>,
    <span class="c-key">"note"</span>: <span class="c-str">"Pembelian via Python"</span>,
    <span class="c-key">"orderId"</span>: <span class="c-str">f"INV-{int(time.time())}"</span>,
    <span class="c-key">"fee_bearer"</span>: <span class="c-str">"CUSTOMER"</span>
}

headers = {
    <span class="c-key">"Content-Type"</span>: <span class="c-str">"application/json"</span>,
    <span class="c-key">"x-secret-key"</span>: SECRET_KEY
}

response = requests.post(API_URL, json=payload, headers=headers)
result = response.json()

<span class="c-kw">if</span> result[<span class="c-str">"success"</span>]:
    payment_url = result[<span class="c-str">"data"</span>][<span class="c-str">"paymentUrl"</span>]
    print(<span class="c-str">f"Redirect ke: {payment_url}"</span>)
<span class="c-kw">else</span>:
    print(<span class="c-str">f"Error: {result['message']}"</span>)</code></pre>
        </div>

        <div class="code-box" v-if="lang==='flutter'">
          <div class="code-box-header">
            <span class="code-box-title">Flutter / Dart HTTP Service</span>
            <span class="code-box-lang">dart</span>
          </div>
          <pre class="code-pre"><code><span class="c-kw">import</span> <span class="c-str">'dart:convert'</span>;
<span class="c-kw">import</span> <span class="c-str">'package:http/http.dart'</span> <span class="c-kw">as</span> http;

Future&lt;String?&gt; createPayment({
  required int amount,
  required String customerName,
}) async {
  final response = await http.post(
    Uri.parse(<span class="c-str">'https://pg.warungerik.com/api/v1/checkout'</span>),
    headers: {
      <span class="c-str">'Content-Type'</span>: <span class="c-str">'application/json'</span>,
      <span class="c-str">'x-secret-key'</span>: <span class="c-str">'sk_live_XXXXXXXXXXXXXXXX'</span>,
    },
    body: jsonEncode({
      <span class="c-str">'amount'</span>: amount,
      <span class="c-str">'customerName'</span>: customerName,
      <span class="c-str">'note'</span>: <span class="c-str">'Pembayaran via Aplikasi Flutter'</span>,
      <span class="c-str">'orderId'</span>: <span class="c-str">'INV-${DateTime.now().millisecondsSinceEpoch}'</span>,
      <span class="c-str">'fee_bearer'</span>: <span class="c-str">'CUSTOMER'</span>,
    }),
  );

  final json = jsonDecode(response.body);
  if (json[<span class="c-str">'success'</span>] == true) {
    return json[<span class="c-str">'data'</span>][<span class="c-str">'paymentUrl'</span>]; <span class="c-cm">// Buka URL di WebView / Browser</span>
  }
  return null;
}</code></pre>
        </div>
      </div>

      <hr class="divider" />

      <div id="response" class="section">
        <h3 class="sh">3. Struktur Response API (Multi-Line JSON)</h3>

        <h4 class="sub-h">A. Response Sukses (HTTP 200 OK)</h4>
        <div class="code-box">
          <div class="code-box-header">
            <span class="code-box-title">Response JSON (HTTP 200 OK)</span>
            <span class="code-box-lang">json</span>
          </div>
          <pre class="code-pre"><code>{
  <span class="c-key">"success"</span>: <span class="c-bool">true</span>,
  <span class="c-key">"message"</span>: <span class="c-str">"Invoice QRIS berhasil diterbitkan."</span>,
  <span class="c-key">"data"</span>: {
    <span class="c-key">"orderId"</span>: <span class="c-str">"INV-1702345678"</span>,
    <span class="c-key">"merchantId"</span>: <span class="c-str">"G053499515"</span>,
    <span class="c-key">"baseAmount"</span>: <span class="c-num">50000</span>,
    <span class="c-key">"uniqueCode"</span>: <span class="c-num">37</span>,
    <span class="c-key">"feeType"</span>: <span class="c-str">"PERCENTAGE"</span>,
    <span class="c-key">"feePercent"</span>: <span class="c-num">0.7</span>,
    <span class="c-key">"feeAmount"</span>: <span class="c-num">350</span>,
    <span class="c-key">"feeBearer"</span>: <span class="c-str">"CUSTOMER"</span>,
    <span class="c-key">"totalAmount"</span>: <span class="c-num">50387</span>,
    <span class="c-key">"netAmount"</span>: <span class="c-num">50000</span>,
    <span class="c-key">"customerName"</span>: <span class="c-str">"Budi Santoso"</span>,
    <span class="c-key">"note"</span>: <span class="c-str">"Pembelian Produk Digital Premium"</span>,
    <span class="c-key">"status"</span>: <span class="c-str">"PENDING"</span>,
    <span class="c-key">"paymentUrl"</span>: <span class="c-str">"https://pg.warungerik.com/pay/INV-1702345678"</span>,
    <span class="c-key">"qrCodeDataUrl"</span>: <span class="c-str">"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."</span>,
    <span class="c-key">"dynamicQris"</span>: <span class="c-str">"00020101021126610014COM.GO-JEK.WWW01189360091430534995150210G0534995150303UMI..."</span>,
    <span class="c-key">"createdAt"</span>: <span class="c-str">"2026-08-07T18:50:00.000Z"</span>,
    <span class="c-key">"expiredAt"</span>: <span class="c-str">"2026-08-07T19:05:00.000Z"</span>
  }
}</code></pre>
        </div>

        <h4 class="sub-h">B. Response Error Autentikasi / Parameter (HTTP 400 / 401)</h4>
        <div class="code-box">
          <div class="code-box-header">
            <span class="code-box-title">Response Error JSON (HTTP 401 Unauthorized)</span>
            <span class="code-box-lang">json</span>
          </div>
          <pre class="code-pre"><code>{
  <span class="c-key">"success"</span>: <span class="c-bool">false</span>,
  <span class="c-key">"statusCode"</span>: <span class="c-num">401</span>,
  <span class="c-key">"error"</span>: <span class="c-str">"UNAUTHORIZED"</span>,
  <span class="c-key">"message"</span>: <span class="c-str">"Invalid or missing x-secret-key header. Silakan periksa Secret Key di Dashboard."</span>,
  <span class="c-key">"timestamp"</span>: <span class="c-str">"2026-08-07T18:50:00.000Z"</span>
}</code></pre>
        </div>

        <div class="info-box">
          <div>
            <strong>Catatan Mengenai Kode Unik & Penomoran QRIS</strong>
            <p>Sistem secara otomatis menyisipkan kode unik 3-digit (100 – 500) pada nominal tagihan QRIS. Hal ini dilakukan agar mesin mutasi memproses verifikasi transaksi secara instan tanpa ada 2 transaksi PENDING yang bentrok. Pelanggan wajib membayar nominal sebesar <code class="hl">totalAmount</code>.</p>
          </div>
        </div>
      </div>

      <hr class="divider" />

      <div id="check-status" class="section">
        <h3 class="sh">4. Cek Status Transaksi (GET /api/v1/order/:orderId)</h3>
        <p class="sp">Gunakan endpoint ini jika Anda ingin melakukan polling status transaksi secara berkala dari backend Anda.</p>

        <div class="endpoint">
          <span class="method get">GET</span>
          <span class="url">https://pg.warungerik.com/api/v1/order/INV-1702345678</span>
        </div>

        <h4 class="sub-h">Response Check Status (HTTP 200 OK)</h4>
        <div class="code-box">
          <div class="code-box-header">
            <span class="code-box-title">Check Order Status Response JSON</span>
            <span class="code-box-lang">json</span>
          </div>
          <pre class="code-pre"><code>{
  <span class="c-key">"success"</span>: <span class="c-bool">true</span>,
  <span class="c-key">"data"</span>: {
    <span class="c-key">"orderId"</span>: <span class="c-str">"INV-1702345678"</span>,
    <span class="c-key">"status"</span>: <span class="c-str">"PAID"</span>,
    <span class="c-key">"baseAmount"</span>: <span class="c-num">50000</span>,
    <span class="c-key">"feeAmount"</span>: <span class="c-num">350</span>,
    <span class="c-key">"totalAmount"</span>: <span class="c-num">50387</span>,
    <span class="c-key">"netAmount"</span>: <span class="c-num">50000</span>,
    <span class="c-key">"customerName"</span>: <span class="c-str">"Budi Santoso"</span>,
    <span class="c-key">"txId"</span>: <span class="c-str">"TXN-QRIS-993847102"</span>,
    <span class="c-key">"paidAt"</span>: <span class="c-str">"2026-08-07T18:52:10.000Z"</span>,
    <span class="c-key">"createdAt"</span>: <span class="c-str">"2026-08-07T18:50:00.000Z"</span>
  }
}</code></pre>
        </div>
      </div>

      <hr class="divider" />

      <div id="webhook" class="section">
        <h3 class="sh">5. Webhook Callback Notification</h3>
        <p class="sp">Saat pembayaran lunas terdeteksi oleh mesin mutasi, server WARUNGERIKPAY otomatis mengirimkan <strong>HTTP POST</strong> ke URL Webhook toko Anda yang telah didaftarkan di halaman <strong>Dashboard → Pengaturan</strong>.</p>

        <div class="endpoint">
          <span class="method post">POST</span>
          <span class="url">https://toko-kamu.com/api/webhook (URL Webhook Toko Anda)</span>
        </div>

        <h4 class="sub-h">Contoh Body Webhook (JSON)</h4>
        <div class="code-box">
          <div class="code-box-header">
            <span class="code-box-title">Webhook Payload Body JSON</span>
            <span class="code-box-lang">json</span>
          </div>
          <pre class="code-pre"><code>{
  <span class="c-key">"event"</span>: <span class="c-str">"payment.success"</span>,
  <span class="c-key">"timestamp"</span>: <span class="c-str">"2026-08-07T18:52:10.000Z"</span>,
  <span class="c-key">"data"</span>: {
    <span class="c-key">"orderId"</span>: <span class="c-str">"INV-1702345678"</span>,
    <span class="c-key">"merchantId"</span>: <span class="c-str">"G053499515"</span>,
    <span class="c-key">"baseAmount"</span>: <span class="c-num">50000</span>,
    <span class="c-key">"uniqueCode"</span>: <span class="c-num">37</span>,
    <span class="c-key">"feeAmount"</span>: <span class="c-num">350</span>,
    <span class="c-key">"feeBearer"</span>: <span class="c-str">"CUSTOMER"</span>,
    <span class="c-key">"totalAmount"</span>: <span class="c-num">50387</span>,
    <span class="c-key">"netAmount"</span>: <span class="c-num">50000</span>,
    <span class="c-key">"customerName"</span>: <span class="c-str">"Budi Santoso"</span>,
    <span class="c-key">"note"</span>: <span class="c-str">"Pembelian Paket Produk Premium"</span>,
    <span class="c-key">"status"</span>: <span class="c-str">"PAID"</span>,
    <span class="c-key">"paidAt"</span>: <span class="c-str">"2026-08-07T18:52:10.000Z"</span>,
    <span class="c-key">"txId"</span>: <span class="c-str">"TXN-QRIS-993847102"</span>
  }
}</code></pre>
        </div>

        <h4 class="sub-h">Daftar HTTP Header Webhook</h4>
        <div class="tw">
          <table>
            <thead>
              <tr><th>Header</th><th>Keterangan</th></tr>
            </thead>
            <tbody>
              <tr><td class="mono bold">Content-Type</td><td><code class="hl">application/json</code></td></tr>
              <tr><td class="mono bold">X-WarungErikPay-Signature</td><td>HMAC SHA-256 Signature dari body JSON (dihasilkan menggunakan Webhook Secret Anda).</td></tr>
              <tr><td class="mono bold">X-WarungErikPay-Event</td><td><code class="hl">payment.success</code></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <hr class="divider" />

      <div id="verify" class="section">
        <h3 class="sh">6. Verifikasi Signature Webhook (HMAC SHA-256)</h3>
        <p class="sp">Untuk memastikan bahwa callback webhook benar-benar berasal dari WARUNGERIKPAY dan tidak dipalsukan, selalu lakukan verifikasi signature HMAC SHA-256 di server backend Anda:</p>

        <div class="lang-tabs">
          <button class="lt" :class="{active: hmacLang==='php'}" @click="hmacLang='php'">PHP Native</button>
          <button class="lt" :class="{active: hmacLang==='node'}" @click="hmacLang='node'">Node.js Express</button>
        </div>

        <div class="code-box" v-if="hmacLang==='php'">
          <div class="code-box-header">
            <span class="code-box-title">PHP Signature Verification</span>
            <span class="code-box-lang">php</span>
          </div>
          <pre class="code-pre"><code><span class="c-kw">&lt;?php</span>
<span class="c-var">$webhookSecret</span> = <span class="c-str">"whsec_YOUR_WEBHOOK_SECRET"</span>;
<span class="c-var">$rawPayload</span>    = file_get_contents(<span class="c-str">"php://input"</span>);
<span class="c-var">$signature</span>     = <span class="c-var">$_SERVER</span>[<span class="c-str">'HTTP_X_WARUNGERIKPAY_SIGNATURE'</span>] ?? <span class="c-str">''</span>;

<span class="c-var">$expectedSig</span>   = hash_hmac(<span class="c-str">'sha256'</span>, <span class="c-var">$rawPayload</span>, <span class="c-var">$webhookSecret</span>);

<span class="c-kw">if</span> (hash_equals(<span class="c-var">$expectedSig</span>, <span class="c-var">$signature</span>)) {
    <span class="c-var">$event</span> = json_decode(<span class="c-var">$rawPayload</span>, <span class="c-bool">true</span>);
    <span class="c-var">$orderId</span> = <span class="c-var">$event</span>[<span class="c-str">'data'</span>][<span class="c-str">'orderId'</span>];

    <span class="c-cm">// Update status order di database kamu menjadi PAID</span>
    <span class="c-cm">// ...</span>

    http_response_code(<span class="c-num">200</span>);
    echo json_encode([<span class="c-str">"status"</span> => <span class="c-str">"SUCCESS"</span>]);
} <span class="c-kw">else</span> {
    http_response_code(<span class="c-num">403</span>);
    echo json_encode([<span class="c-str">"error"</span> => <span class="c-str">"Invalid Signature"</span>]);
}</code></pre>
        </div>

        <div class="code-box" v-if="hmacLang==='node'">
          <div class="code-box-header">
            <span class="code-box-title">Node.js Signature Verification</span>
            <span class="code-box-lang">javascript</span>
          </div>
          <pre class="code-pre"><code><span class="c-kw">const</span> crypto = require(<span class="c-str">'crypto'</span>);

app.post(<span class="c-str">'/webhook'</span>, (req, res) => {
  <span class="c-kw">const</span> signature = req.headers[<span class="c-str">'x-warungerikpay-signature'</span>];
  <span class="c-kw">const</span> payload   = JSON.stringify(req.body);
  <span class="c-kw">const</span> secret    = process.env.WEBHOOK_SECRET;

  <span class="c-kw">const</span> expected = crypto
    .createHmac(<span class="c-str">'sha256'</span>, secret)
    .update(payload)
    .digest(<span class="c-str">'hex'</span>);

  <span class="c-kw">if</span> (signature === expected) {
    <span class="c-kw">const</span> { orderId, status } = req.body.data;
    console.log(<span class="c-str">`Order ${orderId} verified: ${status}`</span>);

    <span class="c-cm">// Update database toko Anda</span>
    res.json({ status: <span class="c-str">'SUCCESS'</span> });
  } <span class="c-kw">else</span> {
    res.status(<span class="c-num">403</span>).json({ error: <span class="c-str">'Invalid signature'</span> });
  }
});</code></pre>
        </div>
      </div>

      <hr class="divider" />

      <div id="status" class="section">
        <h3 class="sh">7. Daftar Status Transaksi</h3>
        <div class="tw">
          <table>
            <thead>
              <tr><th>Status</th><th>Keterangan Sistem</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><span class="sb s-pending">PENDING</span></td>
                <td>Menunggu pembayaran dari pelanggan. Kode QRIS aktif dan bisa disimak/discan.</td>
              </tr>
              <tr>
                <td><span class="sb s-paid">PAID</span></td>
                <td>Pembayaran berhasil terdeteksi lunas dan otomatis terverifikasi oleh mesin mutasi.</td>
              </tr>
              <tr>
                <td><span class="sb s-expired">EXPIRED</span></td>
                <td>Waktu pembayaran telah kadaluarsa (default 15 menit). Kode QRIS tidak lagi berlaku.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <hr class="divider" />

      <div id="errors" class="section">
        <h3 class="sh">8. Kode Error HTTP & Troubleshooting</h3>
        <div class="tw">
          <table>
            <thead>
              <tr><th>HTTP Code</th><th>Pesan Error</th><th>Solusi Masalah</th></tr>
            </thead>
            <tbody>
              <tr>
                <td class="mono bold">400 Bad Request</td>
                <td><code class="hl">Amount is required and must be a number</code></td>
                <td>Pastikan field <code class="hl">amount</code> diisi berupa angka minimal Rp 1.000.</td>
              </tr>
              <tr>
                <td class="mono bold">401 Unauthorized</td>
                <td><code class="hl">Invalid or missing secret key</code></td>
                <td>Periksa header <code class="hl">x-secret-key</code>. Pastikan Secret Key valid dan aktif di Dashboard.</td>
              </tr>
              <tr>
                <td class="mono bold">401 Unauthorized</td>
                <td><code class="hl">API Key is revoked</code></td>
                <td>Secret Key telah dinonaktifkan. Buat key baru di halaman Dashboard → API Key.</td>
              </tr>
              <tr>
                <td class="mono bold">409 Conflict</td>
                <td><code class="hl">No available unique code</code></td>
                <td>Terlalu banyak transaksi PENDING dengan nominal sama persis secara bersamaan. Gunakan nominal unik lain.</td>
              </tr>
              <tr>
                <td class="mono bold">500 Internal Error</td>
                <td><code class="hl">Internal server error</code></td>
                <td>Terjadi gangguan sementara di server. Silakan coba kembali beberapa saat lagi.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard' });

const lang = ref('php');
const hmacLang = ref('php');
</script>

<style scoped>
.card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 28px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.page-title { font-size: 1.15rem; font-weight: 800; color: #0F172A; display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.page-sub { font-size: 0.85rem; color: #64748B; line-height: 1.6; margin-bottom: 20px; }

.toc { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px 20px; margin-bottom: 20px; }
.toc-title { font-size: 0.82rem; font-weight: 800; color: #334155; margin-bottom: 8px; }
.toc-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; }
.toc-link { color: #0891B2; font-size: 0.82rem; font-weight: 600; text-decoration: none; padding: 4px 0; }
.toc-link:hover { color: #0E7490; text-decoration: underline; }

.divider { border: none; border-top: 1px solid #E2E8F0; margin: 24px 0; }

.section { margin-bottom: 8px; }
.sh { font-size: 1.05rem; font-weight: 800; color: #0F172A; margin-bottom: 10px; padding-top: 8px; }
.sub-h { font-size: 0.88rem; font-weight: 700; color: #334155; margin: 16px 0 10px; }
.sp { font-size: 0.85rem; color: #64748B; line-height: 1.6; margin-bottom: 14px; }

.info-box, .warn-box {
  display: flex; gap: 12px; padding: 14px 16px; border-radius: 10px; margin: 14px 0; font-size: 0.82rem; line-height: 1.5;
}
.info-box { background: #ECFEFF; border: 1px solid #A5F3FC; color: #164E63; }
.warn-box { background: #FFFBEB; border: 1px solid #FDE68A; color: #92400E; }
.info-box strong, .warn-box strong { display: block; margin-bottom: 2px; font-size: 0.85rem; }
.info-box p, .warn-box p { margin: 0; }

.endpoint { display: flex; align-items: center; gap: 10px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px 16px; margin-bottom: 14px; overflow-x: auto; }
.method { color: #059669; font-weight: 800; font-size: 0.85rem; flex-shrink: 0; }
.method.post { color: #059669; }
.method.get { color: #0284C7; }
.url { font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; color: #1E293B; word-break: break-all; }

.lang-tabs { display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; }
.lt { background: #F1F5F9; border: 1px solid #E2E8F0; border-radius: 8px; color: #64748B; padding: 6px 14px; font-size: 0.78rem; font-weight: 700; cursor: pointer; transition: 0.2s; }
.lt.active { background: #00AED6; color: #fff; border-color: #00AED6; }
.lt:hover:not(.active) { background: #E2E8F0; color: #334155; }

.code-box {
  background: #0F172A;
  border: 1px solid #1E293B;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.code-box-header {
  background: #1E293B;
  padding: 8px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #334155;
  font-size: 0.72rem;
  font-weight: 700;
}

.code-box-title { color: #94A3B8; }
.code-box-badge { background: #0284C7; color: #fff; padding: 2px 8px; border-radius: 6px; font-size: 0.6rem; }
.code-box-lang { color: #00AED6; font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; text-transform: uppercase; }

.code-pre {
  margin: 0;
  padding: 16px 20px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.78rem;
  line-height: 1.65;
  color: #E2E8F0;
  overflow-x: auto;
  white-space: pre;
  -webkit-overflow-scrolling: touch;
  max-height: 480px;
}

.c-key { color: #38BDF8; font-weight: 600; }
.c-str { color: #4ADE80; }
.c-num { color: #FBBF24; font-weight: 600; }
.c-bool { color: #F472B6; font-weight: 700; }
.c-kw { color: #F472B6; font-weight: 700; }
.c-var { color: #E2E8F0; }
.c-title { color: #A7F3D0; font-weight: 700; }
.c-cm { color: #64748B; font-style: italic; }

.hl { background: #E0F7FA; color: #0E7490; padding: 1px 5px; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; }

.tw { overflow-x: auto; -webkit-overflow-scrolling: touch; margin-bottom: 4px; }
table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.82rem; min-width: 400px; }
th { padding: 10px 12px; background: #F8FAFC; color: #64748B; font-weight: 700; font-size: 0.72rem; border-bottom: 1px solid #E2E8F0; white-space: nowrap; }
td { padding: 12px; border-bottom: 1px solid #F1F5F9; color: #1E293B; }
.mono { font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; }
.bold { font-weight: 700; }

.req { background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA; padding: 1px 8px; border-radius: 10px; font-size: 0.65rem; font-weight: 800; }
.opt { background: #F1F5F9; color: #64748B; border: 1px solid #E2E8F0; padding: 1px 8px; border-radius: 10px; font-size: 0.65rem; font-weight: 800; }

.sandbox-box {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 20px;
}
.sandbox-form { margin-top: 14px; }
.sandbox-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 14px;
}
.fg { display: flex; flex-direction: column; }
.fl { font-size: 0.78rem; font-weight: 700; color: #475569; margin-bottom: 4px; }
.fi { padding: 10px 12px; background: #ffffff; border: 1px solid #CBD5E1; border-radius: 10px; font-size: 0.85rem; color: #0F172A; outline: none; }
.fi:focus { border-color: #00AED6; box-shadow: 0 0 0 3px rgba(0,174,214,0.12); }
.hint-text { font-size: 0.7rem; color: #64748B; margin-top: 2px; }

.fa { display: flex; gap: 10px; }
.btn { padding: 10px 18px; border-radius: 10px; font-size: 0.82rem; font-weight: 700; cursor: pointer; border: none; transition: 0.2s; }
.btn-primary { background: #00AED6; color: #fff; }
.btn-primary:hover { background: #0096B8; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-simulate {
  background: #10B981;
  color: #ffffff;
  width: 100%;
  margin-top: 8px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}
.btn-simulate:hover:not(:disabled) {
  background: #059669;
}
.btn-simulate:disabled { opacity: 0.6; cursor: not-allowed; }

.sandbox-result-card {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #E2E8F0;
}
.sandbox-result-grid {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 16px;
  margin-top: 10px;
}
.sandbox-qr-box {
  background: #ffffff;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.sandbox-qr-img {
  width: 160px;
  height: 160px;
  border-radius: 8px;
  border: 1px solid #E2E8F0;
}
.sandbox-code-box {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .sandbox-grid { grid-template-columns: 1fr; }
  .sandbox-result-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .card { padding: 16px 12px; }
  .page-title { font-size: 1rem; }
  .sh { font-size: 0.92rem; }
  .endpoint { flex-direction: column; align-items: flex-start; gap: 4px; padding: 10px 12px; }
  .url { font-size: 0.68rem; }
  .code-pre { font-size: 0.68rem; padding: 12px; }
  .lt { padding: 5px 10px; font-size: 0.72rem; }
  .toc { padding: 12px 14px; }
  th { font-size: 0.62rem; padding: 8px; }
  td { padding: 10px 8px; font-size: 0.75rem; }
  .info-box, .warn-box { flex-direction: column; gap: 6px; font-size: 0.78rem; }
}
</style>
