// docs: https://github.com/sequelize/sequelize/issues/11579
exports.parseModelToFlatObject = (model) => {
    let obj = {};
  
    for (const [k, v] of Object.entries(model)) {
      if (k.split('.').length > 1) {
        const key = k.split('.')[1];
        obj[key] = v;
      } else obj[k] = v;
    }
    return obj;
  };
  