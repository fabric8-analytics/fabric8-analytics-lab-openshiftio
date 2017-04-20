import 'core-js/es6/string';

import * as $ from 'jquery';
import * as URI from 'urijs';
import '../assets/stylesheets/custom.scss';
import './header.scss';

import { ComponentAnalyses } from './component-analyses';
import { StackAnalyses } from './stack-analyses';

declare global {
  interface Window {
    analytics: SegmentAnalytics.AnalyticsJS;
  }
}

export class ApiLocator {

  buildApiUrl(override: string, subdomain: string, suffix: string) {
    if (override) {
      return override;
    } else {
      // Simple check to trim www
      let domainname: string = window.location.hostname;
      if (domainname.startsWith('www')) {
        domainname = window
          .location
          .hostname
          .slice(4);
      }
      let url = domainname;
      if (window.location.port) {
        url += ':' + window.location.port;
      }
      if (subdomain) {
        url = subdomain + '.' + url + '/';
      }
      if (suffix) {
        url += suffix + '/';
      }
      url = window.location.protocol + '//' + url;
      return url;
    }
  }

}


function loadScripts(url: any) {
  // Alias out jquery for patternfly
  (window as any).jQuery = $;
  (window as any).$ = $;
  // Add patternfly - I don't need it in the main bundle
  $("body").append("<script async src=\"https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/js/" +
    "bootstrap.min.js\"></script>");
  $("body").append("<script async src=\"https://cdnjs.cloudflare.com/ajax/libs/patternfly/3.21.0/js/patter" +
    "nfly.min.js\"></script>");
  if (ANALYTICS_WRITE_KEY != 'disabled') {

    // Load Adobe DTM
    let dpals = {
      'default': 'www.redhat.com/dtm-staging.js',
      'prod-preview.openshift.io': 'www.redhat.com/dtm-staging.js',
      'www.prod-preview.openshift.io': 'www.redhat.com/dtm-staging.js',
      'openshift.io': 'www.redhat.com/dtm.js',
      'www.openshift.io': 'www.redhat.com/dtm.js',
    } as any;
    let dpal: string;
    let hostname = url.hostname();
    if (dpals.hasOwnProperty(hostname)) {
      dpal = dpals[hostname];
    } else {
      dpal = dpals['default'];
    }

    $.ajax({
      url: ('https:' === document.location.protocol ? 'https://' : 'http://') + dpal,
      dataType: 'script',
      success: () => {
        let satellite: any = (window as any)._satellite;
        if (satellite && typeof satellite.pageBottom === 'function') {
          satellite.pageBottom();
        }
        if (
          satellite &&
          typeof satellite.getVisitorId === 'function' &&
          typeof satellite.getVisitorId().getMarketingCloudVisitorID === 'function'
        ) {
          localStorage['openshiftio.adobeMarketingCloudVisitorId'] = satellite.getVisitorId().getMarketingCloudVisitorID();
        }
      }
    });
  }

}

export function addToast(cssClass: string, htmlMsg: string) {
  $("#toastNotification")
    .fadeOut(() =>
      $("#toastNotification")
        .removeClass('hidden')
        .removeClass('alert-info alert-sucess alert-warning alert-danger')
        .addClass(cssClass)
        .fadeIn()
    );
  $("#toastMessage").html(htmlMsg);
}

// ===== Scroll to Top ==== 
$(window).scroll(function () {
  if ($(this).scrollTop() >= 50) {
    $('#return-to-top').fadeIn(200);
  } else {
    $('#return-to-top').fadeOut(200);
  }
});
$('#return-to-top').click(function () {
  $('body,html').animate({
    scrollTop: 0
  }, 500);
});

function collapseNavbar() {
  if ($(".navbar").offset().top > 100) {
    $(".navbar-fixed-top").addClass("top-nav-collapse");
  } else {
    $(".navbar-fixed-top").removeClass("top-nav-collapse");
  }
}

$(window).scroll(collapseNavbar);
$(document).ready(collapseNavbar);

$(document)
  .ready(function () {

    collapseNavbar;

    let url = new URI(window.location.href);
    // Add the JS
    loadScripts(url);

    // Create a nice representation of our URL


    // Hide Home menu item
    $("#home").hide();

    // Build services for the login widget
    // let auth = new Auth();
    // auth.handleLogin(url);
    // auth.handleError(url);
    // auth.updateUserMenu();
    // auth.bindLoginLogout();

    // Build services for the waitlist widget
    //let waitlist = new Waitlist();
    //waitlist.bindWaitListForm();

    // Build services for analysis of compoment
    let componentAnalyses = new ComponentAnalyses();
    componentAnalyses.buildComponentAnalyses();

    // Build services for analysis of stack
    let stackAnalyses = new StackAnalyses();
    stackAnalyses.buildStackAnalyses();

  });

// export class Analytics {

//   loadAnalytics() {
//     if (ANALYTICS_WRITE_KEY != 'disabled') {
//       // Load Segment.io
//       var analytics = (window as any).analytics = (window as any).analytics || [];
//       if (!analytics.initialize) {
//         if (analytics.invoked) {
//           window.console && console.error && console.error("Segment snippet included twice.");
//         } else {
//           analytics.invoked = !0;
//           analytics.methods = [
//             "trackSubmit",
//             "trackClick",
//             "trackLink",
//             "trackForm",
//             "pageview",
//             "identify",
//             "reset",
//             "group",
//             "track",
//             "ready",
//             "alias",
//             "debug",
//             "page",
//             "once",
//             "off",
//             "on"
//           ];
//           analytics.factory = function (t: any) {
//             return function () {
//               var e = Array.prototype.slice.call(arguments);
//               e.unshift(t);
//               analytics.push(e);
//               return analytics
//             }
//           };
//           for (var t = 0; t < analytics.methods.length; t++) {
//             var e = analytics.methods[t];
//             analytics[e] = analytics.factory(e)
//           }
//           analytics.load = function (t: any) {
//             var e = document.createElement("script");
//             e.type = "text/javascript";
//             e.async = !0;
//             e.src = ("https:" === document.location.protocol ? "https://" : "http://") + "cdn.segment.com/analytics.js/v1/" + t + "/analytics.min.js";
//             var n = document.getElementsByTagName("script")[0];
//             n.parentNode.insertBefore(e, n)
//           };
//           analytics.SNIPPET_VERSION = "4.0.0";
//           analytics.load(ANALYTICS_WRITE_KEY);
//           analytics.page('landing');
//         }
//       }
//     }
//   }

//   identifyUser(user: any): any {
//     if (this.analytics) {
//       let traits = {
//         avatar: user.attributes.imageURL,
//         email: user.attributes.email,
//         username: user.attributes.username,
//         website: user.attributes.url,
//         name: user.attributes.fullName,
//         description: user.attributes.bio
//       } as any;
//       if (localStorage['openshiftio.adobeMarketingCloudVisitorId']) {
//         traits.adobeMarketingCloudVisitorId = localStorage['openshiftio.adobeMarketingCloudVisitorId'];
//       }
//       this.analytics.
//         identify(
//         user.id, traits);
//     }
//   }

//   identifyWaitlist(email: string): any {
//     if (this.analytics) {
//       let traits = {
//         email: email,
//       };
//       this.analytics
//         .identify(traits);
//     }
//   }

//   trackWaitlisting(accessCode: string) {
//     if (this.analytics) {
//       this.analytics.track('waitlisted', {
//         accessCode: accessCode
//       });
//     }
//   }

//   trackError(action: string, error: any) {
//     if (this.analytics) {
//       this.analytics.track('error', {
//         error: error,
//         action: action
//       });
//     }
//   }

//   trackLogin() {
//     if (this.analytics) {
//       this.analytics.track('login');
//     }
//   }

//   trackLogout() {
//     if (this.analytics) {
//       this.analytics.track('logout');
//     }
//   }

//   private get analytics(): SegmentAnalytics.AnalyticsJS {
//     return window.analytics;
//   }
// }

// let analytics = new Analytics();

// analytics.loadAnalytics();
