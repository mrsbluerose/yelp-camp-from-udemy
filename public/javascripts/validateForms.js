/* from Bootstrap website: starter JavaScript for disabling form submissions if there are invalid fields
checks forms for the class specified and provides validation for all indicated inputs
in file forms, add 'novalidate' to disable default html validation and class 'needs-validation' to enable
bootstrap validation. Then add 'required' to desired inputs.
*/
(function () {
    'use strict'

    bsCustomFileInput.init(); //calls custom bootstrap file input script in boilerplate file. from https://www.npmjs.com/package/bs-custom-file-input
    
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation') //changed to constant

    // Loop over them and prevent submission
    Array.from(forms) //changed to newer method 'from'
      .forEach(function (form) {
        form.addEventListener('submit', function (event) {
          if (!form.checkValidity()) {
            event.preventDefault()
            event.stopPropagation()
          }

          form.classList.add('was-validated')
        }, false)
      })
  })()