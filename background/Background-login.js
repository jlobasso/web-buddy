/*TODO: HACER EL LOGIN Y GUARDAR PROFILE EN LOCAL STORAGE*/
/*TODO: REVISAR SESSION? */

class BackgroundLogIn {
    constructor() {
    }

    static checkSession = () => {

        const token = Profile.getToken();

        /* TODO: HACER FETCH PARA VER SI EL TOKEN ES VALIDO Y/O SI HAY SESSION ACTIVA*/
        /* TODO: DEBERIAMOS ACTUALIZAR EL PROFILE Y SITES AVAILIBLES ?? */

        if (!token || !Profile.getUserProfile()) {
            BackgroundLogIn.sendSessionStatus(false);
        }
        else {
            BackgroundLogIn.sendSessionStatus(true);
        }


    }


    static sendSessionStatus = (status) => {

        if (!status) {
            /* INFORMAMOS AL POPUP QUE NO HAY SESSION*/
            chrome.runtime.sendMessage({
                target: 'popup',
                action: 'LOGIN',
                value: 'show'
            });

            /* INFORMAMOS A TODAS LAS TABS QUE NO HAY SESSION*/
            //TODO: NO ESTA HECHO EL COMPORTAMIENTO EN mainContent.js
            chrome.tabs.query({}, function (tabs) {
                tabs.forEach((tab, i) => {
                    chrome.tabs.sendMessage(tab.id, {
                        target: 'main-content',
                        action: 'NO_SESSION'
                    });
                });
            });
        } else {

            /* INFORMAMOS AL POPUP QUE HAY SESSION*/
            chrome.runtime.sendMessage({
                target: 'popup',
                action: 'LOGIN',
                value: 'hide',
                username: Profile.getUserProfile().username
            });

            /* INFORMAMOS A TODAS LAS TABS QUE HAY SESSION*/
            //TODO: NO ESTA HECHO EL COMPORTAMIENTO EN mainContent.js
            chrome.tabs.query({}, function (tabs) {
                tabs.forEach((tab, i) => {
                    chrome.tabs.sendMessage(tab.id, {
                        target: 'main-content',
                        action: 'SESSION_AVAILIBLE'
                    });
                });
            });

        }
    }


    static logIn = async (username, password) => {

        // fetch('http://localhost:3000/get-menu')
        //     .then(function (response) {
        //         return response.json();
        //     })

        //     .then(function (myJson) {
        //         console.log(myJson);
        //     });

        const profile = {
            username: username,
            group: null,
            sites: [{
                site: 'instagram',
                script: 'instagram',
                siteRegexp: ['http.:\/\/www.instagram.com.*\/*'],
                availibleActions: [
                    {
                        name: '#HASHTAGS',
                        importName: 'hashtags',
                        hasMenu: true,
                        idMenu: 'hashtag_pulpou_menu',
                        idData: 'hashtag_sub_menu',
                        data: [
                            {
                                name: '#joicobrazil',
                                type: null,
                                data: []
                            },
                            {
                                name: '#autosaescala',
                                type: null,
                                data: []
                            },
                            {
                                name: '#theflash',
                                type: null,
                                data: []
                            },
                            {
                                name: '#spacexploration',
                                type: null,
                                data: []
                            }
                        ]
                    },
                    {
                        name: 'SELLERS',
                        importName: 'sellers',
                        hasMenu: true,
                        idMenu: 'sellers_pulpou_menu',
                        idData: 'sellers_sub_menu',
                        data: [{
                            name: 'WHITELIST',
                            type: 'table',
                            data: [1, 2, 3, 4, 5]
                        },
                        {
                            name: 'BLACKLIST',
                            type: 'table',
                            data: ["uno", "dos", "tres", "cuatro", "cinco"]
                        }]

                    },
                    {
                        name: 'REPORTS',
                        importName: 'reports',
                        hasMenu: true,
                        idMenu: 'reports_pulpou_menu',
                        idData: 'reports_sub_menu',
                        data: []

                    },
                    {
                        name: 'IMAGES',
                        importName: 'images',
                        hasMenu: true,
                        idMenu: 'images_pulpou_menu',
                        idData: 'images_sub_menu',
                        data: []
                    },
                    {
                        name: 'Gallery',
                        importName: 'gallery',
                        hasMenu: false,
                        idMenu: null,
                        idData: null,
                        data: []
                    }
                ]
            },
            {
                site: 'stackoverflow',
                script: 'stackoverflow',
                siteRegexp: ['http.:\/\/stackoverflow.com\/.*'],
                availibleActions: [
                    {
                        name: 'Gallery',
                        importName: 'gallery',
                        hasMenu: false,
                        idMenu: null,
                        idData: null,
                        data: []
                    }
                ]
            },
            {
                site: 'mercadolibre',
                script: 'mercadolibre',
                siteRegexp: ['http.:\/\/www\.mercadoli[b|v]re\.com.*'],
                availibleActions: [
                    {
                        name: 'BUSQUEDAS',
                        importName: 'hashtags',
                        hasMenu: true,
                        idMenu: 'hashtag_pulpou_menu',
                        idData: 'hashtag_sub_menu',
                        data: [
                            {
                                name: '#joicobrazil',
                                type: null,
                                data: []
                            },
                            {
                                name: '#autosaescala',
                                type: null,
                                data: []
                            },
                            {
                                name: '#theflash',
                                type: null,
                                data: []
                            },
                            {
                                name: '#spacexploration',
                                type: null,
                                data: []
                            }
                        ]
                    }
                ]
            }
            ]
        }

        Profile.setUserProfile(profile);
        Profile.setToken("abcdefghi");

        BackgroundLogIn.sendSessionStatus(true);
    }

    static logOut = () => {
        /* TODO: HACER FETCH PARA DESHABILITAR EL TOKEN*/

        /*REMOVEMOS TODA LA INFORMACION*/
        Profile.setToken(false);
        Profile.setUserProfile(false);

        BackgroundLogIn.sendSessionStatus(false);
    }
}