document.addEventListener("click", (e) => {
    const {target} = e;
    if(!target.matches("nav a")){
        return;
    }
    e.preventDefault();
    urlRoute();
});

const urlRoutes = {
    404: {
        template: "/404.html",
        title: "",
        description: ""
    },
    "/": {
        template: "/index.html",
        title: "",
        description: ""
    },
    "/login": {
        template: "/auth/login.html",
        title: "",
        description: ""
    },
    "/JillaPanchayat": {
        template: "/ATS/admin/jillaPanchayat.html",
        title: "",
        description: ""
    },
    "/TalukaPanchayat": {
        template: "/admin/talukaPanchayat.html",
        title: "",
        description: ""
    },
    "/GramPanchayat": {
        template: "/admin/gramPanchayat.html",
        title: "",
        description: ""
    }
};

const urlRoute = (event) => {
    event = event || window.event;
    event.preventDefault();
    window.history.pushState({}, "", event.target.href);
    urlLocaltionHandler();
}; 

const urlLocaltionHandler = async () => {
    const location = window.location.pathname;
    if(location.length == 0) {
        location = "/"
    }

    const route = urlRoutes[location] || urlRoutes[404];
    const html = await fetch(route.template).then((response) =>
    response.text());
    document.getElementById("content").innerHTML = html;
};

urlLocaltionHandler();