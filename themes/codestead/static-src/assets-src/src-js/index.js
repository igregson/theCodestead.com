require('./globals')



if ( document.body.classList.contains('template--index') ) {

  var quicktips = document.getElementsByClassName('excerpt-type-quicktip')
  for (var i = 0; i < quicktips.length; i++) {

    var quicktip = quicktips[i]

    var tip = quicktip.getElementsByClassName('excerpt--excerpt')[0]

    var tipH = tip.offsetHeight
    tip.style.height = 0
    tip.style.opacity = 0
    window.setTimeout(function() {
      tip.classList.add('quicktip-animations')
    }, 500)


    var quicktipToggles = quicktip.getElementsByClassName('quicktip-toggle')
    for (var t = 0; t < quicktipToggles.length; t++) {

        var quicktipToggle = quicktipToggles[t]

        quicktipToggle.addEventListener('click', function() {

          quicktip.classList.toggle('quicktip-open')

          if ( quicktip.classList.contains('quicktip-open') ) {
            tip.style.height = tipH
            tip.style.opacity = 1
          } else {
            tip.style.height = 0
            tip.style.opacity = 0
          }

      })
    }

  }

}