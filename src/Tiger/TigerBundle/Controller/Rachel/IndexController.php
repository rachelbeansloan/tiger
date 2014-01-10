<?php

namespace Tiger\TigerBundle\Controller\Rachel;


use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;


// these import the "@Route" and "@Template" annotations
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;


class IndexController extends Controller
{
    /**
     * @Route("/")
     * @Template()
     */
    public function indexAction()
    {
        if($_SERVER['REQUEST_METHOD'] == "POST"){
            $this->Download();
        }

        return array();
    }

    public function checkPasswordAction()
    {
        $request  = $this->getRequest()->request;
        $pass = $request->get('password');
        $realpass = $this->container->getParameter('download_pass');
        $response = new Response();
        
        if($pass == $realpass)
        {
            $message = 'success';
            $code = 200;
        }    
        
        else
        {
            $message = 'wrong password';
            $code = 400;
        }    
       
        $response->setContent($message);
        $response->setStatusCode($code);
        $response->headers->set('Content-Type', 'text/html');

        return $response;
    }

    public function DownloadAction()
    {
        //we have to check the password again in case anyone tries to access directly
        $request  = $this->getRequest()->request;
        $pass = $request->get('password');
        $realpass = $this->container->getParameter('download_pass');

        if($pass == $realpass)
        {

            $file = $this->get('kernel')->getRootDir() . '/../web' .'/private/ewisdom.apk';
               return new StreamedResponse(
                function () use ($file) {
                    readfile($file);
                }, 200, array('Content-Type' => 'application/octet-stream', 'Content-Disposition' => 'attachment; filename=ewisdom.apk')
                );
        }
        
        return new Response();
            
    }


}
