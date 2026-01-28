

const output = [
    "0x2f0409f7962f6673570d88b917021c615ea575c2654391718439eb354f9be8f3", // leaf 0
    "0x182bd7cd8a47e833b5d7aaae4a6e903e29d586be5d497715fe4699c059663555", // leaf 1
    "0x24d3796a66736dbc07c459a93677d8b3c6ea7881b44e4cde0a52fcc03d0f8e7f", // leaf 2
    "0x0fb591516b1f75fdf3794e2adba00fc4982b5a3681478902e414406b6d29c662", // leaf 3
    "0x0b8139a5ee72805a64984ab6465cd1af05f81e54d7dc5c9b1147bc468821a8a6", // leaf 4
    "0x097d553d65347aa3d04e1531cb8c0bdcf80f8a0bd2fa5146c25c3fbdbe09ef1d", // leaf 5
    "0x1faf3c87bf467366812719f0c255d5012289f57c3bb38bd645b17cf29a1b3582", // leaf 6
    "0x18635cc6e50710146a995e1fd46186162153dd2b3adb00cf20e5a5fc48740a55", // leaf 7
    "0x1abd87a8c71d0aedb5d2ed8f5bc8d37dfe1fdf03402270e021601c5de98a21d6", // level1[0]
    "0x0c48615c7b9facadedaf6f1ee617284665119c2a7d964e5753b9035d38a80641", // level1[1]
    "0x1c2781bc4bc7075fdc65f709516fc2a2538b5d76a9b73448bc123c5895cd5115", // level1[2]
    "0x24845f711fb7df3c075943a7f7f2f1a1cb122ebccfbc7adce5a53abfc5201596", // level1[3]
    "0x1e9865ba844533bc9bc599886db483ac9d87d382e4b408cdf39bf157be79feab", // level2[0]
    "0x13c26b7cb52b20e9ccaaef982a9039f86f3351e39d943920e14dce7a0ee8b866", // level2[1]
    "0x05b2ceffbbdb5c80ba067a41790055510fec571f12a3c2ac0356d3d5e0eb2ac2", // subtree_root
    "0x151b3a67da88e360c0ebd027a012e4064c3a414e20a5586533fe182b31227198", // final_root (THIS IS THE ROOT!)
    "0x0ea559a90beac7d48cc70dfad2fea27621b76f140446329b293a04454ccb0ec3", // zeros[3]
    "0x26f52f9b31ef80782798f2ae44659dc1bedf53ac38366d4dfed74ce7d95ad1d5", // zeros[4]
    "0x2fa27c5cf0185654d6dcf10df1b382324abdf62d73d395be1cc935ab470354f0", // zeros[5]
    "0x01c08b39621c262350bc2ddca369a968a68750dacb269e7aa9915245eb0ec3f1", // zeros[6]
    "0x2a39b3a355f8050db51818064cf8caa6f17148535edff5098625bc539fd4c038", // zeros[7]
    "0x02f8474b5fdf6cfcdb206e08ca30a69d659ff1aa274f1951b9a240a41504a897", // zeros[8]
    "0x255c8588a2609472e1547d5407c25f8f33917034302b4076d78cf07f60d69546", // zeros[9]
    "0x0b01ab3090cbdc900fab5c56945ae060c3c43471a6c421235e5c9fb7d9d08382", // zeros[10]
];

const leaves = output.slice(0, 8);
const level1 = output.slice(8, 12);
const level2 = output.slice(12, 14);
const subtree_root = output[14];
const final_root = output[15];
const zeros = output.slice(16, 24);
console.log("Need to re-run circuit to get all zeros up to level 19");
console.log("Current final_root:", final_root);
