import jwt from 'jsonwebtoken';
import { getApiKeyBySecret, getApiKeyByPublic, getUserById } from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'warungerikpay_jwt_secret_key_889922';

export async function authenticateUserToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : req.query.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak: Token autentikasi tidak ditemukan.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await getUserById(decoded.userId);
    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak: Akun tidak aktif atau tidak ditemukan.'
      });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak: Sesi tidak valid atau telah kadaluarsa.'
    });
  }
}

export async function authenticateAdmin(req, res, next) {
  await authenticateUserToken(req, res, () => {
    if (req.user && req.user.role === 'ADMIN') {
      return next();
    }
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak: Hanya Admin yang dapat mengakses halaman ini.'
    });
  });
}

export async function authenticateMerchantApiKey(req, res, next) {
  const globalSecretKey = process.env.API_SECRET_KEY || process.env.API_KEY || null;

  const providedKey = req.headers['x-secret-key']
    || req.headers['x-api-key']
    || req.headers['authorization']?.replace('Bearer ', '')
    || req.query.secret_key
    || req.query.api_key
    || req.body?.secret_key
    || req.body?.api_key;

  if (!providedKey) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Kunci API (x-secret-key atau x-api-key) wajib disertakan.'
    });
  }

  let keyRecord = (await getApiKeyBySecret(providedKey)) || (await getApiKeyByPublic(providedKey));

  if (keyRecord) {
    req.merchantUser = await getUserById(keyRecord.user_id);
    req.apiKeyRecord = keyRecord;
    return next();
  }

  if (globalSecretKey && providedKey === globalSecretKey) {
    req.merchantUser = { id: 1, name: 'WARUNGERIK Admin', role: 'ADMIN' };
    return next();
  }

  return res.status(401).json({
    success: false,
    message: 'Unauthorized: Secret Key / API Key tidak ditemukan atau telah dinonaktifkan.'
  });
}

export { JWT_SECRET };
