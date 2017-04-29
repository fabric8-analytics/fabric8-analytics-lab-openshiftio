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
    let token = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICIwbEwwdlhzOVlSVnFaTW93eXc4dU5MUl95cjBpRmFvemRRazlyenEyT1ZVIn0.eyJqdGkiOiJlYjYwN2Y3Ni1hOWQxLTRmZmQtOTM3Ni03ZWQ5ZWYxYTc0MzUiLCJleHAiOjE0OTU4NzkxNzIsIm5iZiI6MCwiaWF0IjoxNDkzMjg3MTcyLCJpc3MiOiJodHRwczovL3Nzby5vcGVuc2hpZnQuaW8vYXV0aC9yZWFsbXMvZmFicmljOCIsImF1ZCI6ImZhYnJpYzgtb25saW5lLXBsYXRmb3JtIiwic3ViIjoiY2JlYjE0MWMtMmRlYy00ODUyLWFlMjktYzZjOWIzZTIzMGMxIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoiZmFicmljOC1vbmxpbmUtcGxhdGZvcm0iLCJhdXRoX3RpbWUiOjE0OTMyODY4NzcsInNlc3Npb25fc3RhdGUiOiIyZGU0YzU3NC00MTQ2LTQxODItODM0NC1kNDI5NGE0YTY2NDgiLCJuYW1lIjoiQXJ1bmt1bWFyIFMiLCJnaXZlbl9uYW1lIjoiQXJ1bmt1bWFyIiwiZmFtaWx5X25hbWUiOiJTIiwicHJlZmVycmVkX3VzZXJuYW1lIjoic2FpbGFydW5rdW1hciIsImVtYWlsIjoic2FpbC5hcnVua3VtYXJAZ21haWwuY29tIiwiYWNyIjoiMCIsImNsaWVudF9zZXNzaW9uIjoiM2ZmNTNiMDMtMjA0ZS00M2YzLTkxNTUtNjNjYjYwYzVmNDdlIiwiYWxsb3dlZC1vcmlnaW5zIjpbIioiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYnJva2VyIjp7InJvbGVzIjpbInJlYWQtdG9rZW4iXX0sImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sImF1dGhvcml6YXRpb24iOnsicGVybWlzc2lvbnMiOlt7InNjb3BlcyI6WyJyZWFkOnNwYWNlIiwiYWRtaW46c3BhY2UiXSwicmVzb3VyY2Vfc2V0X2lkIjoiYzk3MGI4MzQtOTRjNi00OTYwLWE0MGUtNmY2ZGM0MTQ0YjQ5IiwicmVzb3VyY2Vfc2V0X25hbWUiOiI0ZGY5MzkyYi05Mzc3LTQ2NDYtYjZkOC0yNTlkM2Y4NGQ4MTcifSx7InNjb3BlcyI6WyJyZWFkOnNwYWNlIiwiYWRtaW46c3BhY2UiXSwicmVzb3VyY2Vfc2V0X2lkIjoiMzc0MmM0YzYtNDc4ZS00MmQzLTgzNTQtNGQ4M2ZjM2Y5NjhhIiwicmVzb3VyY2Vfc2V0X25hbWUiOiJiY2RkODQzNi00MjVhLTQzOGItODY4MS01ZjliZjZkYTYwNGUifSx7InNjb3BlcyI6WyJyZWFkOnNwYWNlIiwiYWRtaW46c3BhY2UiXSwicmVzb3VyY2Vfc2V0X2lkIjoiMmIyMDM0MGYtNTNkMi00ZDRkLTgwMDgtZTQ2MmQ2YzYzOGM4IiwicmVzb3VyY2Vfc2V0X25hbWUiOiI0ZDk3OTU2Ny1mMmVhLTRiM2YtOWE1Mi05NDU1NGE5NTU3M2MifSx7InNjb3BlcyI6WyJyZWFkOnNwYWNlIiwiYWRtaW46c3BhY2UiXSwicmVzb3VyY2Vfc2V0X2lkIjoiNDc5ZWY2OWEtMDczNy00NmUyLTliY2QtZWE1MWNkNTQ3NzM4IiwicmVzb3VyY2Vfc2V0X25hbWUiOiI1MWM3NzQ3MS0yZDUyLTRjMDYtOTY1YS1jZjYwNWUwMjc4YzQifSx7InNjb3BlcyI6WyJyZWFkOnNwYWNlIiwiYWRtaW46c3BhY2UiXSwicmVzb3VyY2Vfc2V0X2lkIjoiZTVlNDExMzAtY2VmNS00YWM2LWJkN2ItMzUyZDI5MjM2ZDExIiwicmVzb3VyY2Vfc2V0X25hbWUiOiJmMTVlY2MxZC04NWRlLTQzYTQtOTk3MC1jZGE3NWRkZDYyOWMifSx7InNjb3BlcyI6WyJyZWFkOnNwYWNlIiwiYWRtaW46c3BhY2UiXSwicmVzb3VyY2Vfc2V0X2lkIjoiN2Y4ZjQ4YTMtMDRiOC00YmFmLTg2YmQtYmE3MzBjMzEwYzc5IiwicmVzb3VyY2Vfc2V0X25hbWUiOiI4NTZmNDA2NC0zNDYwLTQyNDItYWZjYy01MDBkNWMxYjdkMzIifSx7InNjb3BlcyI6WyJyZWFkOnNwYWNlIiwiYWRtaW46c3BhY2UiXSwicmVzb3VyY2Vfc2V0X2lkIjoiOWRkZmE4Y2ItYWRiNi00NGI4LThmMDAtZTMwMmM1MWFiY2NiIiwicmVzb3VyY2Vfc2V0X25hbWUiOiJmYjk4MmUyNi01MzhlLTRlNjEtYmU4My1jOWM0OTY0YTQ4NmIifSx7InNjb3BlcyI6WyJyZWFkOnNwYWNlIiwiYWRtaW46c3BhY2UiXSwicmVzb3VyY2Vfc2V0X2lkIjoiZTRkYjVlMzUtNjNiZC00MjkxLTk0ZmItNjBhM2UxMzU2OGM0IiwicmVzb3VyY2Vfc2V0X25hbWUiOiJmODYzZWE5Yi1iMzI0LTQwNjctYjQ5Ny1lN2FmNzdjY2EwMmYifSx7InNjb3BlcyI6WyJyZWFkOnNwYWNlIiwiYWRtaW46c3BhY2UiXSwicmVzb3VyY2Vfc2V0X2lkIjoiMTNkNTY4YmMtYTA4NC00ZGY2LWFkOWQtODg3MTg2OTc2NzM3IiwicmVzb3VyY2Vfc2V0X25hbWUiOiI1YWY2YmUyYy1lYjNkLTQzZDMtYTVlYi04MjRlOWE4N2JjMWIifSx7InNjb3BlcyI6WyJyZWFkOnNwYWNlIiwiYWRtaW46c3BhY2UiXSwicmVzb3VyY2Vfc2V0X2lkIjoiOTk0MTQ5NmMtZmI2Mi00ODQzLWE4YzItOTIwYmZlNDY5YWEzIiwicmVzb3VyY2Vfc2V0X25hbWUiOiI3MTVmNDI1OS1lZTNjLTQ0OTItOTVhMC1jNjM5M2FjZmFlZmIifSx7InNjb3BlcyI6WyJyZWFkOnNwYWNlIiwiYWRtaW46c3BhY2UiXSwicmVzb3VyY2Vfc2V0X2lkIjoiODUzN2M3YWMtNmYwMy00YTMyLWE5OGUtM2EyYjQ5OTllMGY0IiwicmVzb3VyY2Vfc2V0X25hbWUiOiI1YzFkNzMzNC02NjRmLTQyMDktYjEwMy1hNzBjZmQ0NTQxNmEifV19LCJjb21wYW55IjoiUmVkaGF0In0.BlMxjuHkfRuF8rTdtmkcurQ8BcaBekCXn2eu1FfUMtc7fOGm75Lm3unjnswNt5PNtCS_Qfi95jG4yNmsZ2h3AMfScJu5CLzYCG8fg-bzfYKNR4HOFmvUUvRHEW7Fgo8QsLzM7P0Kw2AOKcdt1E2jMduRtkaCAteMrALjfIm-1A2TTv7-Q_0I_WqHfRwfOj73WSNkP2vFpjd7jUQTKjR4KLx0mMU5-jDNGRIRKfloyfjbW42xm8pwV3M9Xbo10s12DQl0dxYuZHbQBL7gULke7827Yra2CmYAUEKqTgMf8O45iyiLbD9qyI8S_aDNz8R23krHH-Z_j1R2q_MG73OpGw';
    let componentAnalyses = new ComponentAnalyses();
    componentAnalyses.buildComponentAnalyses(token);

    // Build services for analysis of stack
    let stackAnalyses = new StackAnalyses();
    stackAnalyses.buildStackAnalyses(token);

  });

