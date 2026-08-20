// خادم بسيط يستقبل عمليات الصرف من التطبيق ويرسل إشعار تيليجرام حقيقي
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

app.get('/health', (req, res) => {
  res.json({ ok: true, msg: 'خادم أمين المخزن شغّال' });
});

app.post('/notify', async (req, res) => {
  try {
    const { itemName, qty, unit, employee, cost, barcode } = req.body || {};
    if (!itemName || !qty) {
      return res.status(400).json({ ok: false, error: 'بيانات ناقصة' });
    }

    const text =
      `📤 خروج من المخزن\n` +
      `الصنف: ${itemName}\n` +
      `الكمية: ${qty} ${unit || ''}\n` +
      `التكلفة: ${cost != null ? cost + ' د.ع' : '—'}\n` +
      `بواسطة: ${employee || '—'}\n` +
      `الباركود: ${barcode || '—'}\n` +
      `الوقت: ${new Date().toLocaleString('ar-EG')}`;

    const tgUrl = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
    const tgRes = await fetch(tgUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text })
    });
    const tgData = await tgRes.json();

    if (!tgData.ok) {
      return res.status(500).json({ ok: false, error: tgData.description });
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
