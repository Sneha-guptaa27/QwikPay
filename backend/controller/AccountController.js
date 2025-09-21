const { v4: uuid } = require("uuid");
const Account = require("../models/accountSchema");

async function createUPIFromPhone(phone) {
  const last10 = (phone || "").replace(/\D/g,"").slice(-10) || uuid().slice(0,10);
    let handle = `${last10}@qwikpay`;
  // ensure uniqueness
  while(await Account.findOne({ upiId: handle })) {
      handle = `${last10}${Math.floor(Math.random() * 9)}@qwikpay`;
  }
  return handle;
}

exports.createAccount = async function (req, res) {
  const user = req.user;
  console.log(user);
    const { holderName, bankName, accountNumber, ifsc, pan, initialBalancePaise } = req.body;
    if (!accountNumber || !pan) {
        res.status(400).json("Account Number and Pan are required Fields")
    }
  const upiId = await createUPIFromPhone(user.phoneNumber);
    const acc = await Account.create({
    _id: uuid(),
    userId: user._id,
    holderName: holderName,
    bankName,
    accountNumber,
    ifsc,
    pan,
    upiId:upiId,
    currentBalance: initialBalancePaise
  });
  return res.json(acc);
};

exports.getMyAccounts = async function (req, res) {
  const user = req.user;
  const accounts = await Account.find({ userId: user._id });
  res.json(accounts);
};
