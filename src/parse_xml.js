export default function parseXMLString(xmlDocStr) {
    var isIEParser = window.ActiveXObject || "ActiveXObject" in window;
    if (xmlDocStr === undefined) {
        return null;
    }
    var xmlDoc;
    if (window.DOMParser) {
        var parser = new window.DOMParser();
        var parsererrorNS = null;
        // IE9+ now is here
        if (!isIEParser) {
            try {
                parsererrorNS = parser.parseFromString("INVALID", "text/xml").getElementsByTagName("parsererror")[0].namespaceURI;
            }
            catch (err) {
                parsererrorNS = null;
            }
        }
        try {
            xmlDoc = parser.parseFromString(xmlDocStr, "text/xml");
            if (parsererrorNS != null && xmlDoc.getElementsByTagNameNS(parsererrorNS, "parsererror").length > 0) {
                //throw new Error('Error parsing XML: '+xmlDocStr);
                xmlDoc = null;
            }
        }
        catch (err) {
            xmlDoc = null;
        }
    }
    else {
        // IE :(
        if (xmlDocStr.indexOf("<?") == 0) {
            xmlDocStr = xmlDocStr.substr(xmlDocStr.indexOf("?>") + 2);
        }
        xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = "false";
        xmlDoc.loadXML(xmlDocStr);
    }
    return xmlDoc;
}
