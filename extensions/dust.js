'use strict';

// for dust
module.exports = context=>{
    const dr = context.getRenderer('dummy.dust');
    const helpers = dr.dust.helpers;
    
    helpers.keys = (chunk, context, bodies, params)=>{
        const body = bodies.block;

        const obj = params.obj;
        const key = params.key || 'key';
        const value = params.value || 'value';
        for(let name in obj){
            const ctx2 = context.push({
                [key]: name,
                [value] : obj[name],
            });
            chunk.render(body, ctx2);
        }
        return chunk;
    };

    helpers.get = (chunk, context, bodies, params)=>{
        const body = bodies.block;
        const key = params.key;
        const obj = params.obj;
        if (key in obj){
            chunk.write(obj[key]);
        }else{
            chunk.render(body, context);
        }
        return chunk;
    };

    helpers.isin = (chunk, context, bodies, params)=>{
        const body = bodies.block;
        const elsebody = bodies['else'];
        const key = params.key;
        const obj = params.obj;
        if (key in obj){
            chunk.render(body, context);
        }else if(elsebody){
            chunk.render(elsebody, context);
        }
        return chunk;
    };
};
