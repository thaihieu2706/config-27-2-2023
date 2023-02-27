Swal.fire({
  titleText: 'Thanks a lot.',
  icon: 'success',
  html: 'Thanks a lot for using Story Saver, if you find this extension useful, please rate us, this will mean a lot to us :)<br>If there\'s any problem in it, don\'t hesitate to send your feedback to <a href="mailto:mohelm97@gmail.com">mohelm97@gmail.com</a>.',
  showConfirmButton: true,
  confirmButtonText: 'Rate it now <3',
  showCancelButton: true,
  cancelButtonText: 'Later :(',
  backdrop: false,
  allowOutsideClick: false,
  confirmButtonColor: '#27ae60',
}).then((result) => {
    if (result.value){
        if  (navigator.userAgent.indexOf("Edg") != -1)
          window.open("https://microsoftedge.microsoft.com/addons/detail/story-saver/jdljfilepfajjkcnomidldigogbobjod", "_blank");
        else
          window.open("https://chrome.google.com/webstore/detail/story-saver/mafcolokinicfdmlidhaebadidhdehpk/reviews", "_blank");
        chrome.runtime.sendMessage (null, { rateClicked:true });
    }
});