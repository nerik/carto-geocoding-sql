/*eslint-env mocha*/

var geocode = require('../index');
var country = require('../src/country');
var prepareFragments = require('../src/prepareFragments');
var SQLFunction = require('../src/SQLFunction');
var transformFragments = require('../src/transformFragments');
var SQL = require('../src/SQL');
var expect = require('chai').expect;

describe('geocode()', function() {
  it('should throw an error when no argument is sent', function() {
    expect(function() {
      geocode();
    }).to.throw(/no arguments/);
  } );
  it('should throw an error if provided location is not a string', function() {
    expect(function() {
      geocode(42);
    }).to.throw(/not a string/);
  });
  /* eslint-disable quotes */
  it('should work with a single fragment city', function() {
    expect(geocode('Stockholm')).to.equal("SELECT cdb_geocode_namedplace_point('Stockholm') the_geom;");
  });
  it('should work with a country', function() {
    expect(geocode('South Africa')).to.equal("SELECT ST_Centroid(cdb_geocode_admin0_polygon('South Africa')) the_geom;");
  });
  it('should work with an IP', function() {
    expect(geocode('200.199.198.197')).to.equal("SELECT cdb_geocode_ipaddress_point('200.199.198.197') the_geom;");
  });
  it('should work with city, country pair', function() {
    expect(geocode('Paris, USA')).to.equal("SELECT cdb_geocode_namedplace_point('Paris','USA') the_geom;");
  });
  it('should work with postal code, country pair', function() {
    expect(geocode('75013, France')).to.equal("SELECT cdb_geocode_postalcode_point('75013','France') the_geom;");
  });
  it('should work with a 3 fragments street level query', function() {
    expect(geocode('201 Moore St, Brooklyn, USA')).to.equal("SELECT cdb_geocode_street_point('201 Moore St','Brooklyn','','USA') the_geom;");
  });
  it('should work with a 4 fragments street level query', function() {
    expect(geocode('201 Moore St, Brooklyn, NY, USA')).to.equal("SELECT cdb_geocode_street_point('201 Moore St','Brooklyn','NY','USA') the_geom;");
  });
  it('should work with multiple geocodes', function() {
    expect(geocode('Utrecht', '81.204.10.10', 'Roelof Hartplein 2G, Amsterdam, Nederland')).to.equal("SELECT cdb_geocode_namedplace_point('Utrecht') the_geom UNION SELECT cdb_geocode_ipaddress_point('81.204.10.10') the_geom UNION SELECT cdb_geocode_street_point('Roelof Hartplein 2G','Amsterdam','','Nederland') the_geom;");
  });
  /* eslint-enable quotes */
});

describe('prepareFragments()', function() {
  it('should make fragments out of a location string', function() {
    expect(prepareFragments('Rue Ksar el Badia,   Casablanca, Algeria')).to.eql(['Rue Ksar el Badia', 'Casablanca', 'Algeria']);
  });
});

describe('getCountry()', function() {
  context('when provided fragment is a country', function() {
    it('should return true', function() {
      expect(country('Andorra')).to.be.true;
    });
  });
  context('when provided fragment is a country, using local name', function() {
    it('should return true', function() {
      expect(country('Principat d\'Andorra')).to.be.true;
    });
  });
  context('when provided fragment is not a country', function() {
    it('should return false', function() {
      expect(country('Hyderabad')).to.be.false;
    });
  });
});

describe('SQLFunction()', function() {
  context('when a single fragment is provided', function() {
    context('when provided fragment has a match in country list', function() {
      it('should return country', function() {
        expect(SQLFunction(['Belgium'])).to.equal('cdb_geocode_admin0_polygon');
      });
    });
    context('when provided fragment matches IP adresses format', function() {
      it('should return IP', function() {
        expect(SQLFunction(['79.148.44.76'])).to.equal('cdb_geocode_ipaddress_point');
      });
    });
    context('when provided fragment is doesnt match country/IP formats', function() {
      it('should return city', function() {
        expect(SQLFunction(['Antofagasta'])).to.equal('cdb_geocode_namedplace_point');
      });
    });
  });
  context('when 2 fragments are provided', function() {
    context('when provided fragment is made up of more numbers than letters', function() {
      it('should return postal code', function() {
        expect(SQLFunction(['H3R 1K2', 'Canada'])).to.equal('cdb_geocode_postalcode_point');
      });
    });
    it('should return city if not a zip code', function() {
      expect(SQLFunction(['Limoges','Canada'])).to.equal('cdb_geocode_namedplace_point');
    });
    // it should return adm1 poly if a polygon is requested
  });
  context('when 3 fragments are provided', function() {
    it('should return street level', function() {
      //in this case we should provide null as state and use 3rd component as country
      expect(SQLFunction(['26 Rue du Pont de la Mousque','Bordeaux','France'])).to.equal('cdb_geocode_street_point');
    });
  });
  context('when 4 fragments are provided', function() {
    it('should return street level', function() {
      expect(SQLFunction(['Paris Blvd','Paris','Texas','USA'])).to.equal('cdb_geocode_street_point');
    });
  });
});

describe('transformFragments', function() {
  context('when 3 fragments are provided and SQL function is street level', function() {
    it('should remove provide null as state and use 3rd component as country', function() {
      expect(transformFragments(['Strada Dobrogea 28', 'Brașov', 'Romania'], 'cdb_geocode_street_point')).to.eql(['Strada Dobrogea 28', 'Brașov', null, 'Romania']);
    });
  });
});

describe('SQL()', function() {
  it('should build an SQL query', function() {
    expect(SQL({
      fragments: ['Paris Blvd','Paris','Texas','USA'],
      sqlFunction: 'cdb_geocode_street_point'
    })).to.equal('SELECT cdb_geocode_street_point(\'Paris Blvd\',\'Paris\',\'Texas\',\'USA\') the_geom;');
  });
  it('should build an SQL query with centroid when SQL function returns a polygon', function() {
    expect(SQL({
      fragments: ['Thailand'],
      sqlFunction: 'cdb_geocode_admin0_polygon'
    })).to.equal('SELECT ST_Centroid(cdb_geocode_admin0_polygon(\'Thailand\')) the_geom;');
  });
  it('should build an SQL query with multiple geocodes', function() {
    expect(SQL([
      {
        fragments: ['Buenos Aires'],
        sqlFunction: 'cdb_geocode_namedplace_point'
      },
      {
        fragments: ['Córdoba','Argentina'],
        sqlFunction: 'cdb_geocode_namedplace_point'
      },
      {
        fragments: ['Argentina'],
        sqlFunction: 'cdb_geocode_admin0_polygon'
      }
    ])).to.equal('SELECT cdb_geocode_namedplace_point(\'Buenos Aires\') the_geom UNION SELECT cdb_geocode_namedplace_point(\'Córdoba\',\'Argentina\') the_geom UNION SELECT ST_Centroid(cdb_geocode_admin0_polygon(\'Argentina\')) the_geom;');
  });
});
