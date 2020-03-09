let listening = false
let nests = []
let startLatitude,startLongitude,endLatitude,endLongitude,map

function handleLoading(){
    console.log("entered handleLoading")
    let time = new Date().toLocaleTimeString()
    document.getElementById("date-time").innerHTML = "Time: "+ time;    


    if(!listening){
        console.log("entered listening")
        const evtSource = new EventSource("http://ec2-13-57-13-127.us-west-1.compute.amazonaws.com:3000/events");
        evtSource.onmessage = function(event) {
            const parsedData = JSON.parse(event.data)
            if(nests.length===0){
                nests = nests.concat(parsedData)
                console.log(nests.length) 
                for(let i = 0; i < nests.length; i++){
                    document.getElementById("collapsible-set").innerHTML += `<button type="button" id="${i}" class="collapsible" onclick="handleDetails(id)">Complaint No: ${i+1}</button>
                    <div id="content-id-${i}" class="content" style="display:none;"><input type="checkbox" id="checkbox-${i}-${nests[i].id}" onchange="handleButton(id)" style="margin:15px;zoom:2;float:left;transform:scale(1.5);"><p font="bold" text-align="center" padding-top=5px> Owner's name: ${nests[i].name}<br/>
                    License Plate: ${nests[i].id}<br/>Date: ${nests[i].date}<br/>Address: ${nests[i].address}</p><div id="map-${i}" class="map">map</div></div>`
                    endLatitude = nests[i].latitude; endLongitude = nests[i].longitude
                    //initMap(i)
                    //calculateRoute(startLatitude,startLongitude,endLatitude,endLongitude)
                }
            }else{
                nests = nests.concat(parsedData)
                console.log(nests)
                let i = nests.length-1
                console.log("else ",i)
            
                /*document.getElementById("collapsible-set").innerHTML += `<button type="button" id="${i}" class="collapsible" onclick="handleDetails(id)">Complaint No: ${i+1}</button>
                <div id="content-id-${i}" class="content" style="display:none;"><input type="checkbox" id="checkbox-${i}-${nests[i].id}" onchange="handleButton(id)" style="float:left"><p style="padding: 0px; margin: 0px;">Owner's name: ${nests[i].name}<br/>
                License Plate: ${nests[i].id}<br/>Date: ${nests[i].date}<br/>Address: ${nests[i].address}</p><div id="map-${i}" class="map">map</div></div>`
                endLatitude = nests[i].latitude; endLongitude = nests[i].longitude*/
                document.getElementById("collapsible-set").innerHTML += `<button type="button" id="${i}" class="collapsible" onclick="handleDetails(id)">Complaint No: ${i+1}</button>
                <div id="content-id-${i}" class="content" style="display:none;"><input type="checkbox" id="checkbox-${i}-${parsedData.id}" onchange="handleButton(id)" style="margin:15px;zoom:2;float:left;transform:scale(1.5);"><p text-align="center" padding-top=5px> Owner's name: ${parsedData.name}<br/>
                License Plate: ${parsedData.id}<br/>Date: ${parsedData.date}<br/>Address: ${parsedData.address}</p><div id="map-${i}" class="map">map</div></div>`
                endLatitude = parsedData.latitude; endLongitude = parsedData.longitude

            }
        }
        listening = true
        evtSource.onerror = function(err) {
            console.error("EventSource failed:", err);
        };
            //document.getElementById("collapsible-id").innerHTML = nests[0].name
            //document.getElementById("content-id").innerHTML = `<p>${nests[0].id}</p>`
    }else{
        console.log("entered in else block")
        console.log(nests.length)
    }

    geoFindMe()
}

function handleDetails(i){
    //console.log("clicked ",i)
    let id = "content-id-"+i
    //console.log(id)
    var content = document.getElementById(id);
    if (content && content.style.display === "block") {
        content.style.display = "none";
    } else {
        content.style.display = "block";
    }
    initMap(i)
}

function handleButton(i){
    console.log(i)
    let strArr = i.split('-')
    console.log(strArr)
    handleDetails(strArr[1])
    document.getElementById(strArr[1]).disabled=true
    //const data = "{'id':'"+strArr[2]+"'}"
    const data = {
        id: strArr[2]
    }
    console.log(data)
    try {
		var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            
		};
        request.open("POST", 'http://ec2-13-57-13-127.us-west-1.compute.amazonaws.com:3000/events/handled', true);
        request.setRequestHeader("Content-Type","application/json")
        request.send(JSON.stringify(data));
    } catch (e) {
        console.log("error: " + e.description);
    }
    
}


function geoFindMe() {
    function success(position) {
        startLatitude  = position.coords.latitude;
        startLongitude = position.coords.longitude;
  
        console.log(startLatitude,' ',startLongitude)
    }
  
    function error() {
      status.textContent = 'Unable to retrieve your location';
    }
  
    if (!navigator.geolocation) {
      status.textContent = 'Geolocation is not supported by your browser';
    } else {
      status.textContent = 'Locating…';
      navigator.geolocation.getCurrentPosition(success, error);
    }
  
  }

  var directionsService
  var directionsRenderer

  function initMap(i){
    
    if(startLatitude!==undefined && startLongitude!==undefined){
        directionsService = new google.maps.DirectionsService();
        directionsRenderer = new google.maps.DirectionsRenderer()
        //console.log(lt,' ',long)
        let myLatLng = {lat: startLatitude, lng: startLongitude}
        map = new google.maps.Map(document.getElementById('map-'+i), {
            center: myLatLng,
            zoom: 10
        });
        if(endLatitude!==undefined && endLongitude!==undefined)
            calculateRoute(startLatitude,startLongitude,endLatitude,endLongitude)
        directionsRenderer.setMap(map);
        //document.getElementById('map1').style.display='inline'
        directionsRenderer.setPanel(document.getElementById('map-'+i));
       
    }

}

  function calculateRoute(startLatitude,startLongitude,endLatitude,endLongitude){

    var start = new google.maps.LatLng(startLatitude, startLongitude);
    //var end = new google.maps.LatLng(38.334818, -181.884886);
    var end = new google.maps.LatLng(endLatitude,endLongitude);
    var request = {
      origin: start,
      destination: end,
      travelMode: google.maps.TravelMode.DRIVING
    };
    directionsService.route(request, function(response, status) {
        if (status == 'OK') {
          directionsRenderer.setDirections(response);
        }
    });
}
  