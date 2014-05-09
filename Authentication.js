var Authentication = function( ){
    
    // Given by Crackle
    var PARTNER_KEYWORD = 'HTADOJZIIDMPQKBR';
    var PARTNER_ID = 40;
//    var PARTNER_KEYWORD = 'WTVVTQITDTWCKKPV';
//    var PARTNER_ID = 14;
    
    this.AuthorizationHeader = function( url ){
        var date            = new Date();
        var timestamp       = date.format('yyyyMMddHHmm');
        var encrypt_url     = url + "|" + timestamp;
        var hmac            = Crypto.HMAC( Crypto.SHA1, encrypt_url, PARTNER_KEYWORD );
        
        var authorization   = hmac + "|" + timestamp + "|" + PARTNER_ID + "|1";
        var resp            = {'Authorization': authorization.toUpperCase() };

        console.log( "********" );
        console.log( "Authorization: " + authorization.toUpperCase() );
        
        return resp;
    }
}