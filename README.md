# Nite Overlay - Overview

Generates an overlay to illustrate the day/night cycle. The night side is shaded slightly darker.

Works with D3.geo

The sun position is estimated using an adapted method from NOAA's solar calculator, which is based on equations from Astronomical Algorithms, by Jean Meeus.  
More details: http://www.esrl.noaa.gov/gmd/grad/solcalc/calcdetails.html

## Quick start

```javascript
var width = 960;
var height = 480;

var projection = d3.geo.equirectangular()
    .scale(153)
    .translate([width / 2, height / 2])
    .precision(.1);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select('body').append('svg')
    .attr('width', width)
    .attr('height', height);
...
nite.init(svg);
```
Use `refresh()` method to update the overlay periodically. Perhaps via `setInterval()`;

```
setInterval(function() { nite.refresh() }, 20 * 60 * 1000); // every 20m
```

Alternatively, a specific date can be selected via `setDate()` followed by a call to `refresh()` to redraw the overlay. Setting the date to `null` will cause nite overlay to use current date and time.

Note: *If the overlay is hidden and refresh() is called, the overlay position will not be updated.

## Available methods

`nite.setMap()` set a specific map object  -- Not Implemented Yet
`nite.setDate(Date object)` set a specific datetime, or `null` to use current datetime  
`nite.calculatePositionOfSun(Date object)` returns LatLng for the specified date (has no effect on the overlay)  
`nite.refresh()` Recalculate and refresh the position of the overlay  
`nite.isVisible()` returns a boolean if the overlay is visible on the map  
`nite.show()` Make the overlay visible  
`nite.hide()` Hide the overlay  
`nite.getSunPosition()` returns LatLng for the Sun  
`nite.getShadowPosition()` returns LatLng for the night side  
