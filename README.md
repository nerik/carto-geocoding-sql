# carto-geocoding-sql
Turns simple text locations into SQL queries ready to be run against CARTO [geocoding API](https://carto.com/docs/carto-engine/dataservices-api/geocoding-functions/).

It'll \**magically*\*™ decide which SQL function it should call depending on the content you provide.

## Examples

```
var geocodeSQL = require('carto-geocoding-sql');

geocodeSQL('Stockholm');
// SELECT cdb_geocode_namedplace_point('Stockholm') the_geom;
// assumes a city by default

geocodeSQL('South Africa');
// SELECT ST_Centroid(cdb_geocode_admin0_polygon('South Africa')) the_geom;
// ... unless it's a country, in which case it will use its centroid

geocodeSQL('200.199.198.197');
SELECT cdb_geocode_ipaddress_point('200.199.198.197') the_geom;
// IP adresses !

geocodeSQL('Paris, USA');
// SELECT cdb_geocode_namedplace_point('Paris','USA') the_geom;
// two fragments separated by a comma: assume city, country

geocodeSQL('75013, France');
// SELECT cdb_geocode_postalcode_point('75013','France') the_geom;
// numbers in first fragment: assume postal code

geocodeSQL('201 Moore St, Brooklyn, USA');
geocodeSQL('201 Moore St, Brooklyn, NY, USA');
// SELECT cdb_geocode_street_point('201 Moore St','Brooklyn','','USA') the_geom;
// street level address with 3+ fragments, with or without state

```


## CLI

Carto-geocoding-sql can be run on the command line with `carto-geocode-sql`:

```
➜ carto-geocode-sql 'Germany'
SELECT ST_Centroid(cdb_geocode_admin0_polygon('Germany')) the_geom;
➜ carto-geocode-sql 'Beijing'
SELECT cdb_geocode_namedplace_point('Beijing') the_geom;
```

Protip: use with [the CARTO node client CLI](https://github.com/CartoDB/cartodb-nodejs)

```
➜ cartodb -f geojson "`carto-geocode-sql '201 Moore St, Brooklyn, USA'`"
{"type": "FeatureCollection", "features": [{"type":"Feature","geometry":{"type":"Point","coordinates":[-73.93661,40.70442]},"properties":{}}]}
```

## yeah

Runs on Node > 4.0
Should run on the browser, but it has not been tested and should be packaged with your method of choice.
