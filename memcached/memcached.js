const Memcached = require('memcached');

var server = process.env.SERVER || '127.0.0.1:11211';
var memcached = new Memcached(server);

function getAllItemsAsync(callback){
    return (memcached.slabs(function(err, slabs){
        if (err) throw err;
        console.log(slabs);

        //asco
        var validsSlabsIds = slabs.filter(item => item !== 'server' );
        validsSlabsIds = slabs.filter(item => item !== 'active_slabs' );
        validsSlabsIds = slabs.filter(item => item !== 'total_malloced' );
        let slabsIds = Object.keys(slabs[0]);
        var slabsCount = slabs.length;
        var items = [];
        for (let slabId in slabsIds) {
            let slabIdInt = parseInt(slabId);
            if ( slabIdInt !== NaN){
                memcached.cachedump(server, slabIdInt, 0, function(err, cachedump){
                    if (err) throw err;
                    console.log(cachedump);
                    if(cachedump){
                        memcached.get(cachedump.key, function(err, data){
                            slabsCount--;
                            if (err) throw err;
                            items.push({
                                key : cachedump.key,
                                data : data
                            });
                            
                            if (slabsCount == 0){
                                console.log(items);
                                callback(items);
                                
                            } //malisimo
                        });
                    }
                })
            } 
        }
    }))
}

function getAllItems(callback) {
    getAllItemsAsync(callback);
}
function store(key, item, lifetime=10, callback){
    memcached
        .set(key,
            item,
            lifetime,
            function (err) {
                 if (err)console.log(err);
                 if (callback) callback();
            });
}

module.exports.getAllItems = getAllItems;
module.exports.store = store;