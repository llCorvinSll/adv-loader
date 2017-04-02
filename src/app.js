import {
    Promise
} from 'es6-promise';
import 'whatwg-fetch';
import parseXMLString from './parse_xml';

const vast_url = 'http://api.viqeo.tv/v1/data/init?video[]=1853477d5dcac86d1260&profile=12';
const SPLASH_ID = 'js-loader__splash';
var splash_elem = document.getElementById(SPLASH_ID);

const VIDEO_ID = 'js-loader__video';
var video_elem = document.getElementById(VIDEO_ID);

fetch(vast_url)
    .then((response) => {
        if (response.ok) {
            return response.json();
        } else {
            return Promise.reject("data request failed");
        }
    })
    .then(handleFirstResponce)
    .then(handleVAST)
    .then(playVideo).catch((error) => {
        alert('some error');
        console.error(error);
    });

function setupSplash(splash) {
    splash_elem.src = splash;
}

function hideSplash() {
  splash_elem.className += " loader__splash--hidden";
}


function handleFirstResponce(data) {
    let format = data.formats[0];
    let splash = format.options.previewImage;
    let data_url = format.dataUrl;

    if (!data_url) {
        return Promise.rejected('no vast link');
    }

    if (splash) {
        setupSplash(splash);
    }

    return fetch(data_url, {
        headers: {
            'Content-Type': 'text/plain'
        },
    }).then((response) => {
        if (response.ok) {
            return response.text();
        } else {
            return Promise.reject("vast request failed");
        }
    }).then((vast_str) => {
        return parseXMLString(vast_str);
    });
}

function handleVAST(vast) {
      let files = vast.getElementsByTagName('MediaFile');

      if (files && files.length) {
          let first_file = files[0];
          let video_url = extractCDATA(first_file);

          let type = first_file.getAttribute('type');

          return {
            url: video_url,
            type: type
          };
      } else {
          return Promise.rejected("No media files in VAST");
      }
}

function playVideo(video) {
  function addSourceToVideo(element, video) {
    var source = document.createElement('source');

    source.src = video.url;
    source.type = video.type;

    element.appendChild(source);
  }

  video_elem.addEventListener('canplay', (ev) => {
    hideSplash();
  });

  addSourceToVideo(video_elem, video);
}

export function extractCDATA(elem) {
    const CDATA_SECTION_NODE = 4;
    const TEXT_SECTION_NODE = 3;

    let res = "";

    for (let i = 0; i < elem.childNodes.length; i++) {
        let cur_elem = elem.childNodes.item(i);

        if (
            cur_elem.nodeType === CDATA_SECTION_NODE ||
            cur_elem.nodeType === TEXT_SECTION_NODE
        ) {
            if (cur_elem.nodeValue) {
                res += cur_elem.nodeValue.trim();
            }
        }
    }

    return !!res ? res.trim() : null;
}
