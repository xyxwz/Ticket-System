var should = require("should"),
    Route = require("../../../lib/middleware/access_control/route");

/* Access Control Route Unit Test */

describe('Route', function(){
  var router;

  beforeEach(function(){
    router = new Route("/test/route/:number/abc/:string");
  });


  describe('.match(path)', function(){
    it('should match based on path string', function(){
      var path = "/test/route/123/abc/def";
      var route = router.match(path);
      route[0].should.equal('/test/route/123/abc/def');

      path = "/test/route/123";
      route = router.match(path);
      should.not.exist(route);
    });
  });

  describe('.mapKeys', function(){
    beforeEach(function(){
      router.match('/test/route/123/abc/def');
    });

    it('should match named parameters to path values', function(){
      var paramKeys = router.mapKeys();
      var props = Object.keys(paramKeys);
      props.length.should.equal(2);
      paramKeys[props[0]].should.equal('123');
      paramKeys[props[1]].should.equal('def');
    });
  });

});
