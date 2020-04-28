'use strict';

const path = require('path');

module.exports = context=>{
    let datacache = null;
    let pageTable = null;

    // 基本データの用意
    context.addPostLoadDataHook(context=>{
        const data = context.data;
        const jobs = data.jobs.jobs;
        // 人狼系に襲撃されても死亡しない役職の一覧
        const wolfToleranceJobs = [];
        // ヴァンパイア耐性
        const vampireToleranceJobs = [];
        // 護衛能力ある役職の一覧
        const wolfGuardJobs = [];
        for (let key in jobs){
            const job = jobs[key];
            if (job.wolfTolerance){
                wolfToleranceJobs.push(job);
            }
            if (job.vampireTolerance){
                vampireToleranceJobs.push(job);
            }
            if (job.wolfGuard){
                wolfGuardJobs.push(job);
            }
        }
        data.dynamic = {
            wolfToleranceJobs,
            vampireToleranceJobs,
            wolfGuardJobs,
        };
    });

    // [[ページ名]] 記法の変換
    context.addPostRenderHook((context, content, target)=>{
        if (!/\.html$/.test(target)){
            return content;
        }
        const data = context.data;
        if(datacache != data){
            // ページ名とURLの対応を作る
            datacache = data;
            pageTable = Object.assign({
                "身代わりくん":"/scapegoat.html",
                "死因一覧":"/found.html",
                "設定":"/options.html",
                "蘇生":"/revive.html",
                "勝利判定":"/judge.html",
                "闇鍋":"/yaminabe.html",
                "ケミカル人狼":"/chemical.html",
                "即時発動型能力":"/immediateSkills.html",
                "占い能力":"/skills/divine.html",
                "役職一覧":"/jobs/index.html",
                "陣営一覧":"/teams/index.html",
                "系統一覧":"/categories/index.html",
                "サブ役職一覧":"/subs/index.html",
            }, data.urlTable);
            const jobs = data.jobs;
            const js = jobs.jobs;
            const teams = jobs.teams;
            const categories = jobs.categories;
            const subs = jobs.subs;
            for(let job in js){
                pageTable[js[job].name] = `/jobs/${job}.html`;
            }
            for(let t in teams){
                pageTable[teams[t]] = `/teams/${t}.html`;
            }
            for(let c in categories){
                pageTable[categories[c]] = `/categories/${c}.html`;
            }
            for(let s in subs){
                pageTable[subs[s].name] = `/subs/${s}.html`;
            }
        }
        // ページのアレを置き換える
        return content.replace(/\[\[(?:([^\]]+?)\|)?([^\]]+?)\]\]/g, (str, name, to)=>{
            if(!name){
                name = to;
            }
            if(pageTable[to] == null){
                console.warn(`${str} is not found!!`); 
                return str;
            }
            // html escape???
            return `<a href='${pageTable[to]}'>${name}</a>`;
        });
    });

    // ページ情報を用意
    context.addPreRenderHook((context, filename, data)=>{
        // ページ名ごとに対応するあれを作る
        const rootDir = context.settings.rootDir;
        const jobs = data.jobs;
        const rltv = path.relative(rootDir, filename);
        const adds = {};
        // ページの種別ごとにあれを用意する
        let r;
        if (r = rltv.match(/^jobs\/(\w+)\.dust/)){
            const j = r[1];
            // 役職ページだ
            adds.job = jobs.jobs[j];
        }else if(r = rltv.match(/^teams\/(\w+)\.dust/)){
            const t = r[1];
            adds.team = jobs.teams[t];
        }else if(r = rltv.match(/^categories\/(\w+)\.dust/)){
            const t = r[1];
            adds.category = jobs.categories[t];
        }else if(r = rltv.match(/^subs\/(\w+)\.dust/)){
            const t = r[1];
            adds.sub = jobs.subs[t];
        }

        return {
            data: Object.assign({}, data, adds),
        };
    });
};
