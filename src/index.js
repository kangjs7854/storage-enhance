const SYMOBOL_PRFIX = "SYMOBOL_PRFIX";

const INIFINITY = "Infinity";

const TIMESTAMP_PREFIX = "TIMESTAMP_PREFIX";

const getObjectType = (obj) =>
  Object.prototype.toString.call(obj).match(/\[object (.*)\]/)[1];
/**
 * 增强web storage
 * 支持存储Symbol、infinity
 *
 */
function genStorageEnhance(storage) {
  /**
   *
   * 存储临时的id和Symbol的映射关系
   * 在有用到symbol去处理一些id关联关系时，在序列化时可以先通过一个临时的id去替换，最后反序列化时再还原
   * {
   *    [temporaryId] : Symbol()
   * }
   */
  mapTemporaryIdToSymbol = {};

  const genTemporaryId = () =>
    SYMOBOL_PRFIX +
    Number(Math.random().toString().substr(3, 3) + Date.now()).toString(36);

  const gentemporaryTimestamp = (date) => `${TIMESTAMP_PREFIX}_${+data}`;

  const getDateByTemporaryTimestamp = (str) => str.split("_")[1];

  const getItem = (cacheKey) => {
    const cacheValue = storage.getItem(cacheKey);
    return JSON.parse(cacheValue, (key, value) => {
      if (typeof value === "string") {
        if (value === INIFINITY) return Infinity;
        if (value.includes(TIMESTAMP_PREFIX)) {
          return getDateByTemporaryTimestamp(value);
        }
        if (value.includes(SYMOBOL_PRFIX)) {
          return mapTemporaryIdToSymbol[value];
        }
      }
      return value;
    });
  };

  const setItem = (cacheKey, cacheValue) => {
    storage.setItem(
      cacheKey,
      JSON.stringify(cacheValue, (key, value) => {
        if (value === Infinity) {
          return INIFINITY;
        }

        //todo 判断时间是已经被转成字符串了
        switch (getObjectType(value)) {
          case "Date":
            return gentemporaryTimestamp(value);
        }

        if (typeof value === "symbol") {
          const symbolId = value;

          for (let id in mapTemporaryIdToSymbol) {
            if (mapTemporaryIdToSymbol[id] === symbolId) {
              return id;
            }
          }

          const temporaryId = genTemporaryId();
          Object.assign(mapTemporaryIdToSymbol, {
            [temporaryId]: symbolId,
          });
          return temporaryId;
        }

        return value;
      })
    );
  };

  return {
    getItem,
    setItem,
  };
}
