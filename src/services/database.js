import Parse from '@/config/back4app';

/* ---------- helpers ---------- */

function toPlain(obj)
{
    return { id: obj.id, ...obj.attributes };
}

function liveSubscribe(className, callback, { sortField = 'createdAt', sortOrder = 'descending', max = 100 } = {})
{
    const q = new Parse.Query(className);
    q[sortOrder](sortField);
    q.limit(max);

    // Initial fetch
    q.find().then((results) => callback(results.map(toPlain)));

    // Live Query subscription
    let sub = null;
    q.subscribe().then((subscription) =>
    {
        sub = subscription;
        const refresh = () => q.find().then((r) => callback(r.map(toPlain)));
        sub.on('create', refresh);
        sub.on('update', refresh);
        sub.on('delete', refresh);
    });

    return () => { if (sub) sub.unsubscribe(); };
}

/* ---------- real-time subscriptions ---------- */

export function subscribeToUsers(callback, maxResults = 100)
{
    return liveSubscribe('AppUser', callback, { max: maxResults });
}

export function subscribeToDeposits(callback)
{
    return liveSubscribe('Deposit', callback, { max: 50 });
}

export function subscribeToWithdrawals(callback)
{
    return liveSubscribe('Withdrawal', callback, { max: 50 });
}

export function subscribeToTrades(callback)
{
    return liveSubscribe('Trade', callback, { max: 100 });
}

export function subscribeToAiArbitrage(callback)
{
    return liveSubscribe('AiArbitrage', callback, { max: 50 });
}

export function subscribeToActiveChats(callback)
{
    return liveSubscribe('Chat', callback, { sortField: 'updatedAt', max: 50 });
}

/* ---------- admin actions ---------- */

export async function updateUserBalance(userId, newBalance)
{
    const q = new Parse.Query('AppUser');
    const user = await q.get(userId);
    user.set('balance', newBalance);
    await user.save();
}

export async function updateDepositStatus(depositId, status)
{
    const q = new Parse.Query('Deposit');
    const dep = await q.get(depositId);
    dep.set('status', status);
    await dep.save();
}

export async function updateWithdrawalStatus(withdrawalId, status)
{
    const q = new Parse.Query('Withdrawal');
    const wd = await q.get(withdrawalId);
    wd.set('status', status);
    await wd.save();
}

export async function updateKycStatus(userId, kycStatus)
{
    const q = new Parse.Query('AppUser');
    const user = await q.get(userId);
    user.set('kycStatus', kycStatus);
    await user.save();
}

/* ================================================================
   USER-FACING REAL-TIME OPERATIONS
   All app users get live data via Parse Live Query
   ================================================================ */

/** Subscribe to a specific user's portfolio / balance (real-time) */
export function subscribeToUserPortfolio(walletAddress, callback)
{
    const q = new Parse.Query('AppUser');
    q.equalTo('address', walletAddress.toLowerCase());

    let sub = null;

    q.first().then((user) =>
    {
        if (user) callback(toPlain(user));
        else callback(null);
    });

    q.subscribe().then((subscription) =>
    {
        sub = subscription;
        const handler = (obj) => callback(toPlain(obj));
        sub.on('create', handler);
        sub.on('update', handler);
    });

    return () => { if (sub) sub.unsubscribe(); };
}

/** Subscribe to a user's deposit history (real-time) */
export function subscribeToUserDeposits(walletAddress, callback)
{
    const q = new Parse.Query('Deposit');
    q.equalTo('walletAddress', walletAddress.toLowerCase());
    q.descending('createdAt');
    q.limit(50);

    let sub = null;

    q.find().then((r) => callback(r.map(toPlain)));

    q.subscribe().then((subscription) =>
    {
        sub = subscription;
        const refresh = () => q.find().then((r) => callback(r.map(toPlain)));
        sub.on('create', refresh);
        sub.on('update', refresh);
    });

    return () => { if (sub) sub.unsubscribe(); };
}

/** Subscribe to a user's withdrawal history (real-time) */
export function subscribeToUserWithdrawals(walletAddress, callback)
{
    const q = new Parse.Query('Withdrawal');
    q.equalTo('walletAddress', walletAddress.toLowerCase());
    q.descending('createdAt');
    q.limit(50);

    let sub = null;

    q.find().then((r) => callback(r.map(toPlain)));

    q.subscribe().then((subscription) =>
    {
        sub = subscription;
        const refresh = () => q.find().then((r) => callback(r.map(toPlain)));
        sub.on('create', refresh);
        sub.on('update', refresh);
    });

    return () => { if (sub) sub.unsubscribe(); };
}

/** Subscribe to a user's trade history (real-time) */
export function subscribeToUserTrades(walletAddress, callback)
{
    const q = new Parse.Query('Trade');
    q.equalTo('walletAddress', walletAddress.toLowerCase());
    q.descending('createdAt');
    q.limit(100);

    let sub = null;

    q.find().then((r) => callback(r.map(toPlain)));

    q.subscribe().then((subscription) =>
    {
        sub = subscription;
        const refresh = () => q.find().then((r) => callback(r.map(toPlain)));
        sub.on('create', refresh);
        sub.on('update', refresh);
    });

    return () => { if (sub) sub.unsubscribe(); };
}

/** Subscribe to global live market trades (all users see this feed) */
export function subscribeToLiveMarketFeed(callback)
{
    return liveSubscribe('Trade', callback, { max: 30 });
}

/** Subscribe to platform-wide stats (real-time) */
export function subscribeToPlatformStats(callback)
{
    const q = new Parse.Query('PlatformStats');
    q.descending('updatedAt');
    q.limit(1);

    let sub = null;

    q.first().then((s) => callback(s ? toPlain(s) : null));

    q.subscribe().then((subscription) =>
    {
        sub = subscription;
        const handler = (obj) => callback(toPlain(obj));
        sub.on('create', handler);
        sub.on('update', handler);
    });

    return () => { if (sub) sub.unsubscribe(); };
}

/** Subscribe to live price tickers stored in Back4App (real-time) */
export function subscribeToPriceTickers(callback)
{
    return liveSubscribe('PriceTicker', callback, { sortField: 'updatedAt', max: 100 });
}

/* ---------- user write operations ---------- */

/** Create a deposit request */
export async function createDeposit({ walletAddress, amount, token, network, txHash })
{
    const Deposit = Parse.Object.extend('Deposit');
    const deposit = new Deposit();
    deposit.set('walletAddress', walletAddress.toLowerCase());
    deposit.set('amount', Number(amount));
    deposit.set('token', token);
    deposit.set('network', network);
    deposit.set('txHash', txHash || '');
    deposit.set('status', 'pending');
    await deposit.save();
    return toPlain(deposit);
}

/** Create a withdrawal request */
export async function createWithdrawal({ walletAddress, amount, token, toAddress, network })
{
    const Withdrawal = Parse.Object.extend('Withdrawal');
    const wd = new Withdrawal();
    wd.set('walletAddress', walletAddress.toLowerCase());
    wd.set('amount', Number(amount));
    wd.set('token', token);
    wd.set('toAddress', toAddress);
    wd.set('network', network);
    wd.set('status', 'pending');
    await wd.save();
    return toPlain(wd);
}

/** Create a trade record */
export async function createTrade({ walletAddress, pair, side, amount, price, type, leverage, timeframe })
{
    const Trade = Parse.Object.extend('Trade');
    const trade = new Trade();
    trade.set('walletAddress', walletAddress.toLowerCase());
    trade.set('pair', pair);
    trade.set('side', side);
    trade.set('amount', Number(amount));
    trade.set('price', Number(price));
    trade.set('type', type || 'market');
    trade.set('status', 'open');
    if (leverage) trade.set('leverage', leverage);
    if (timeframe) trade.set('timeframe', timeframe);
    await trade.save();
    return toPlain(trade);
}

/* ================================================================
   TRADING LEVEL CONFIGS
   Stored as TradingLevelConfig objects in Back4App.
   type: 'binary' | 'arbitrage'
   level: 1-5
   ================================================================ */

/**
 * Fetch all trading level configs for a given type ('binary' or 'arbitrage').
 * Returns an array of plain objects sorted by level.
 */
export async function getTradingLevelConfigs(type)
{
    const q = new Parse.Query('TradingLevelConfig');
    q.equalTo('type', type);
    q.ascending('level');
    q.limit(10);
    const results = await q.find();
    return results.map(toPlain);
}

/**
 * Subscribe to live updates of trading level configs.
 */
export function subscribeToTradingLevelConfigs(type, callback)
{
    const q = new Parse.Query('TradingLevelConfig');
    q.equalTo('type', type);
    q.ascending('level');
    q.limit(10);

    let sub = null;

    q.find().then((r) => callback(r.map(toPlain)));

    q.subscribe().then((subscription) =>
    {
        sub = subscription;
        const refresh = () => q.find().then((r) => callback(r.map(toPlain)));
        sub.on('create', refresh);
        sub.on('update', refresh);
        sub.on('delete', refresh);
    });

    return () => { if (sub) sub.unsubscribe(); };
}

/**
 * Save (upsert) a single trading level config.
 * @param {Object} cfg - { type, level, name, profitPercent, tradingTime, minCapital }
 */
export async function saveTradingLevelConfig(cfg)
{
    const q = new Parse.Query('TradingLevelConfig');
    q.equalTo('type', cfg.type);
    q.equalTo('level', cfg.level);
    let record = await q.first();

    if (!record) {
        const TradingLevelConfig = Parse.Object.extend('TradingLevelConfig');
        record = new TradingLevelConfig();
        record.set('type', cfg.type);
        record.set('level', cfg.level);
    }

    record.set('name', cfg.name);
    record.set('profitPercent', Number(cfg.profitPercent));
    record.set('tradingTime', Number(cfg.tradingTime));
    record.set('minCapital', Number(cfg.minCapital));
    await record.save();
    return toPlain(record);
}

/** Register or update a user's wallet connection in Back4App */
export async function registerWalletUser(walletAddress, provider)
{
    const q = new Parse.Query('AppUser');
    q.equalTo('address', walletAddress.toLowerCase());
    let user = await q.first();

    if (!user) {
        const AppUser = Parse.Object.extend('AppUser');
        user = new AppUser();
        user.set('address', walletAddress.toLowerCase());
        user.set('balance', 0);
        user.set('kycStatus', 'pending');
    }

    user.set('provider', provider);
    user.set('lastSeen', new Date());
    await user.save();
    return toPlain(user);
}
