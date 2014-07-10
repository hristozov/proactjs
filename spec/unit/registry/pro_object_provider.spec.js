'use strict';

describe('Pro.Registry.ProObjectProvider', function () {
  var provider;
  beforeEach(function () {
    provider = new Pro.Registry.ProObjectProvider();
  });

  describe('#make', function () {
    it ('creates and stores in the registry a Pro.Value if called with simple value', function () {
      var val = provider.make('test', 5);

      expect(P.U.isProVal(val)).toBe(true);
      expect(val.v).toBe(5);
    });

    it ('creates and stores in the registry a Pro.Array if called with array value', function () {
      var val = provider.make('test', [4, 5, 6]);

      expect(P.U.isProArray(val)).toBe(true);
      expect(val.valueOf()).toEqual([4, 5, 6]);
    });

    it ('creates and stores in the registry a pro object if called with object value', function () {
      var val = provider.make('test', {
        val: 5,
        valPow: function () {return this.val * this.val;}
      });

      expect(P.U.isProObject(val)).toBe(true);
      expect(val.val).toEqual(5);
      expect(val.valPow).toEqual(25);
    });

    it ('is able to pass meta-data while creating a ProAct object', function () {
      var res = [], val = provider.make('test', {
            x: 5,
            y: 4,
            pow: function () {return this.x * this.y;}
          },
          {
            pow: ['@($1)', function (val) {res.push(val);}]
          });

      val.pow;
      val.y = 5;

      expect(res.length).toBe(1);
      expect(res[0].type).toBe(ProAct.Event.Types.value);
    });
  });
});
