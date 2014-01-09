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

use Tiger\TigerBundle\Form\ContactType;

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

/*
 * @Route("/contact", _name="contact")
 * @Template()
 */
public function contactAction(Request $request)
{
    $form = $this->createForm(new ContactType());

    if ($request->isMethod('POST')) {
        $form->bind($request);

        if ($form->isValid()) {
            $message = \Swift_Message::newInstance()
                ->setSubject($form->get('subject')->getData())
                ->setFrom($form->get('email')->getData())
                ->setTo('rachel@tigerwebdev.com')
                ->setBody(
                    $this->renderView(
                        'TigerBundle:Default:contact.html.twig',
                        array(
                            'ip' => $request->getClientIp(),
                            'name' => $form->get('name')->getData(),
                            'message' => $form->get('message')->getData()
                        )
                    )
                );

            $this->get('mailer')->send($message);

            $request->getSession()->getFlashBag()->add('success', 'Your email has been sent! Thanks!');

            return $this->redirect($this->generateUrl('contact'));
        }
    }

    return array(
        'form' => $form->createView()
    );
}
}
